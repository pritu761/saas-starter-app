import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prisma from "@/prisma/lib/prisma";

export async function POST(){
    const { userId } = await auth();
    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    //capture payment method
    try {
        const user = await prisma.user.update({
            where: {
                id: userId
            }})
        if(!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
      

        const subscriptionEnds = new Date(Date.now() + 31536000000)

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isSubscribed: true,
                subscriptionEnds
            }
        })
        return NextResponse.json({
            message:"Subscription Successful",
            subscriptionEnds: updatedUser.subscriptionEnds})
    }
    catch (error) {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}

export async function GET(){
    const { userId} = await auth();
    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                isSubscribed: true,
                subscriptionEnds: true
            }
        })
        if(!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        const now = new Date()
        if(user.subscriptionEnds < now && user.isSubscribed) {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    isSubscribed: false,
                    subscriptionEnds: null
                }
            })
            return NextResponse.json({
                isSubscribed: false,
                subscriptionEnds: null
            })

        }
        return NextResponse.json(user)
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}