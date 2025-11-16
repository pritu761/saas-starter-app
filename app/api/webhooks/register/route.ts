import { Webhook } from "svix";
import {headers} from 'next/headers'
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/prisma/lib/prisma";

export async function POST(req:Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if(!WEBHOOK_SECRET){
        return new Response("Missing Webhook Secret", {status:400})
    }
    const headerPayload = headers();
    const svixId =
    (await headerPayload).get("svix-id")
    const svixTimestamp =
    (await headerPayload).get("svix-timestamp")
    const svixSignature =
    (await headerPayload).get("svix-signature")

    if(!svixId || !svixTimestamp || !svixSignature){
        return new Response("Missing svix headers", {status:400})
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let event: WebhookEvent;
    try {
        event = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature
        }) as WebhookEvent;
    } catch (err) {
        return new Response("Bad signature", {status:400})
    }
    const {id} = event.data;
    const eventType = event.type; 
    if(eventType === "user.created"){
        try{
            const {email_addresses, primary_email_address_id} = event.data;
            //optional
            const primaryEmail = email_addresses.find((email_address: any) => email_address.id === primary_email_address_id);
            if(!primaryEmail){
                return new Response("Missing primary email", {status:400})
            }
            const user = await prisma.user.create({
                data: {
                    email: email_addresses,
                    primaryEmail: primary_email_address_id,
                    clerkUserId: id
                }
            })
            console.log(user)
        }catch(err){
            return new Response("Error creating user", {status:400})
        }
    } 
    return new Response("Webhook received successfully", {status:200})
}