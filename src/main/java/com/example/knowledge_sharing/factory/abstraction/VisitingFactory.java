package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.common.invitation.Invitation;
import com.example.knowledge_sharing.factory.simple.VisitingCard;

public class VisitingFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new VisitingCard();
    }

    @Override
    public Envelope createEnvelope() {
        return new VisitingEnvelope();
    }
}
