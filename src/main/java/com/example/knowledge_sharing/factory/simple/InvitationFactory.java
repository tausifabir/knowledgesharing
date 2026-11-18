package com.example.knowledge_sharing.factory.simple;

import com.example.knowledge_sharing.common.invitation.Invitation;

public class InvitationFactory {
    public static Invitation create(String type) {
        if ("wedding".equals(type)) return new WeddingCard();
        if ("birthday".equals(type)) return new BirthdayCard();
        if ("visiting".equals(type)) return new VisitingCard();
        if ("membership".equals(type)) return new MembershipCard();
        if ("gift".equals(type)) return new GiftCard();
        if ("playing".equals(type)) return new PlayingCard();
        throw new IllegalArgumentException("Unknown type: " + type);
    }

}
