// backend/src/routes/stripeRoutes.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import express from 'express';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// POST: Crear sesión de pago de Stripe Checkout
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  const { userId, userEmail } = req.body;

  try {
    // Buscar o crear el customer en Stripe
    let customerId: string;
    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({ email: userEmail });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?payment=cancelled`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creando sesión de Stripe:", error);
    res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

// POST: Crear portal de gestión de suscripción (cancelar, cambiar plan)
router.post('/customer-portal', async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'No se encontró suscripción' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creando portal:", error);
    res.status(500).json({ error: 'Error al crear el portal' });
  }
});

// POST: Webhook de Stripe (¡debe usar raw body!)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    // Manejar los eventos de Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await prisma.$transaction([
          // Guardar/actualizar la suscripción
          prisma.subscription.upsert({
            where: { userId },
            update: {
              stripeCustomerId: session.customer as string,
              status: subscription.status,
              planId: subscription.items.data[0].price.id,
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              status: subscription.status,
              planId: subscription.items.data[0].price.id,
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          }),
          // Marcar al usuario como premium
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: true },
          }),
        ]);

        console.log(`✅ Usuario ${userId} activado como Premium`);
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active';

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });

        // Si la suscripción se cancela, quitar Premium
        if (!isActive) {
          const sub = await prisma.subscription.findFirst({
            where: { stripeCustomerId: subscription.customer as string },
          });
          if (sub) {
            await prisma.user.update({
              where: { id: sub.userId },
              data: { isPremium: false },
            });
          }
          console.log(`❌ Suscripción cancelada para customer ${subscription.customer}`);
        }
        break;
      }
    }

    res.json({ received: true });
  }
);

export default router;