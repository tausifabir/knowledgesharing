package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.common.invitation.Invitation;
import com.example.knowledge_sharing.factory.simple.WeddingCard;

public class WeddingFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new WeddingCard();
    }

    @Override
    public Envelope createEnvelope() {
        return new WeddingEnvelope();
    }
}
