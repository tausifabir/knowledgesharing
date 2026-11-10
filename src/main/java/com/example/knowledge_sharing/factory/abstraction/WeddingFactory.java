package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.factory.simple.Invitation;
import com.example.knowledge_sharing.factory.simple.WeddingInvitation;

public class WeddingFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new WeddingInvitation();
    }

    @Override
    public Envelope createEnvelope() {
        return new WeddingEnvelope();
    }
}
