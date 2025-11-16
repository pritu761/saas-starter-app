import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prisma from "@/prisma/lib/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest){
    const { userId } = await auth();
    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    try{
        const todos = await prisma.todo.findMany({
            where: {
                userId: userId,
                title: {
                    contains: search,
                    mode: 'insensitive'
                }
            },
            skip: (page - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            orderBy: {
                createdAt: 'desc'
            }
        })

        const totalitems = await prisma.todo.count({
            where: {
                userId: userId,
                title: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        })
        const totalpages = Math.ceil(totalitems / ITEMS_PER_PAGE);

        return NextResponse.json({
            todos,
            currentPage : page,
            totalpages
        })
    } catch (err) {
        console.error("Error updating subscription:", err);
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
}

export async function POST(req: NextRequest){
    const { userId } = await auth();
    if(!userId) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            todos: true
        }
    })
    console.log(user)
    if(!user) {
        return NextResponse.json({error: "User Not Found"}, {status: 404})
    }
    if(!user.isSubscribed && user.todos.length>= 3) {
        return NextResponse.json({error: "Free users can only have 3 todos. Upgrade to pro to have unlimited todos"}, {status: 401})
        
    }
    const {title} = await req.json()

    const todo = await prisma.todo.create({
        data: {
            title,
            userId
        }
    })

    return NextResponse.json(todo,{status: 201})
}