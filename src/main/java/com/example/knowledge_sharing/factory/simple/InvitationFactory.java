package com.example.knowledge_sharing.factory.simple;

public class InvitationFactory {
    public static Invitation create(String type) {
        if ("wedding".equals(type)) {
            return new WeddingInvitation();
        }
        if ("birthday".equals(type)) {
            return new BirthdayInvitation();
        }
        throw new IllegalArgumentException("Unknown type: " + type);
    }

}
