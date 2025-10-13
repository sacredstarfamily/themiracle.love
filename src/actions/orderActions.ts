"use server";

import { FulfillmentStatus, Prisma } from "@prisma/client";
import prisma from "../lib/pc";

interface CreateOrderData {
    userId: string;
    paypal_order_id: string;
    paypal_payer_id?: string;
    paypal_payer_email?: string;
    paypal_payer_name?: string;
    paypal_capture_id?: string;
    paypal_transaction_id?: string;
    total_amount: number;
    currency_code?: string;
    order_metadata?: unknown;
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        paypal_product_id?: string;
    }>;
}

interface UpdateOrderFulfillmentData {
    orderId: string;
    fulfillment_status: FulfillmentStatus;
    order_notes?: string;
}

export async function createOrder(orderData: CreateOrderData) {
    try {
        // Check if user exists (skip for guest users)
        if (orderData.userId !== 'guest') {
            const userExists = await prisma.user.findUnique({
                where: { id: orderData.userId },
                select: { id: true }
            });

            if (!userExists) {
                throw new Error(`User with ID ${orderData.userId} not found`);
            }
        }

        // Check if order with this PayPal order ID already exists
        const existingOrder = await prisma.order.findFirst({
            where: { paypal_order_id: orderData.paypal_order_id }
        });

        if (existingOrder) {
            console.log(`Order with PayPal ID ${orderData.paypal_order_id} already exists`);
            return existingOrder;
        }

        const order = await prisma.order.create({
            data: {
                userId: orderData.userId === 'guest' ? undefined : orderData.userId,
                paypal_order_id: orderData.paypal_order_id,
                paypal_payer_id: orderData.paypal_payer_id,
                paypal_payer_email: orderData.paypal_payer_email,
                paypal_payer_name: orderData.paypal_payer_name,
                paypal_capture_id: orderData.paypal_capture_id,
                paypal_transaction_id: orderData.paypal_transaction_id,
                total_amount: orderData.total_amount,
                currency_code: orderData.currency_code || "USD",
                payment_method: "paypal",
                payment_status: "COMPLETED", // Only create orders with completed payments
                payment_date: new Date(),
                fulfillment_status: FulfillmentStatus.PENDING, // Now this will work
                status: "COMPLETED", // Payment completed, awaiting fulfillment
                order_metadata: orderData.order_metadata === undefined
                    ? undefined
                    : orderData.order_metadata === null
                        ? Prisma.JsonNull
                        : orderData.order_metadata,
                items: {
                    create: orderData.items.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        paypal_product_id: item.paypal_product_id,
                        img_url: "/placeholder.png" // Default image
                    }))
                }
            },
            include: {
                items: true,
                User: orderData.userId === 'guest' ? false : {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        console.log(`Order created successfully: ${order.id} for PayPal order: ${orderData.paypal_order_id}`);
        return order;
    } catch (error) {
        console.error("Error creating order:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error("Order with this PayPal order ID already exists");
            } else if (error.code === 'P2003') {
                throw new Error("Invalid user reference");
            }
        }

        throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateOrderFulfillment(fulfillmentData: UpdateOrderFulfillmentData) {
    try {
        const order = await prisma.order.update({
            where: {
                id: fulfillmentData.orderId
            },
            data: {
                fulfillment_status: fulfillmentData.fulfillment_status,
                order_notes: fulfillmentData.order_notes,
                updatedAt: new Date()
            },
            include: {
                items: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return order;
    } catch (error) {
        console.error("Error updating order fulfillment:", error);
        throw new Error("Failed to update order fulfillment");
    }
}

// Legacy function - kept for backward compatibility but updated to handle payment completion
export async function updateOrderPayment(paymentData: {
    paypal_order_id: string;
    paypal_payer_id?: string;
    paypal_payer_email?: string;
    paypal_payer_name?: string;
    paypal_capture_id?: string;
    paypal_transaction_id?: string;
    payment_status: string;
    payment_date?: Date;
}) {
    try {
        const existingOrder = await prisma.order.findFirst({
            where: {
                paypal_order_id: paymentData.paypal_order_id
            }
        });

        if (!existingOrder) {
            throw new Error("Order not found");
        }

        const order = await prisma.order.update({
            where: {
                id: existingOrder.id
            },
            data: {
                paypal_payer_id: paymentData.paypal_payer_id,
                paypal_payer_email: paymentData.paypal_payer_email,
                paypal_payer_name: paymentData.paypal_payer_name,
                paypal_capture_id: paymentData.paypal_capture_id,
                paypal_transaction_id: paymentData.paypal_transaction_id,
                payment_status: paymentData.payment_status,
                payment_date: paymentData.payment_date || new Date(),
                status: paymentData.payment_status === "COMPLETED" ? "COMPLETED" : "PENDING",
                // Reset fulfillment to PENDING when payment is completed
                fulfillment_status: paymentData.payment_status === "COMPLETED" ? FulfillmentStatus.PENDING : existingOrder.fulfillment_status,
                updatedAt: new Date()
            },
            include: {
                items: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return order;
    } catch (error) {
        console.error("Error updating order payment:", error);
        throw new Error("Failed to update order payment");
    }
}

export async function getOrderByPayPalId(paypalOrderId: string) {
    try {
        const order = await prisma.order.findFirst({
            where: {
                paypal_order_id: paypalOrderId
            },
            include: {
                items: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return order;
    } catch (error) {
        console.error("Error fetching order by PayPal ID:", error);
        throw new Error("Failed to fetch order");
    }
}

export async function getUserOrders(userId: string, limit: number = 10, offset: number = 0) {
    try {
        const orders = await prisma.order.findMany({
            where: {
                userId
            },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        const totalCount = await prisma.order.count({
            where: {
                userId
            }
        });

        return {
            orders,
            totalCount,
            hasMore: offset + limit < totalCount
        };
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw new Error("Failed to fetch user orders");
    }
}

export async function getAllOrders(limit: number = 50, offset: number = 0, status?: string, fulfillmentStatus?: FulfillmentStatus) {
    try {
        const whereCondition: Record<string, unknown> = {};
        if (status) whereCondition.status = status;
        if (fulfillmentStatus) whereCondition.fulfillment_status = fulfillmentStatus;

        const orders = await prisma.order.findMany({
            where: whereCondition,
            include: {
                items: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        const totalCount = await prisma.order.count({
            where: whereCondition
        });

        return {
            orders,
            totalCount,
            hasMore: offset + limit < totalCount
        };
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw new Error("Failed to fetch orders");
    }
}

export async function getOrdersByFulfillmentStatus(fulfillmentStatus: FulfillmentStatus, limit: number = 50, offset: number = 0) {
    try {
        const orders = await prisma.order.findMany({
            where: {
                fulfillment_status: fulfillmentStatus,
                payment_status: "COMPLETED" // Only include completed payments
            },
            include: {
                items: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });

        const totalCount = await prisma.order.count({
            where: {
                fulfillment_status: fulfillmentStatus,
                payment_status: "COMPLETED"
            }
        });

        return {
            orders,
            totalCount,
            hasMore: offset + limit < totalCount
        };
    } catch (error) {
        console.error("Error fetching orders by fulfillment status:", error);
        throw new Error("Failed to fetch orders by fulfillment status");
    }
}
