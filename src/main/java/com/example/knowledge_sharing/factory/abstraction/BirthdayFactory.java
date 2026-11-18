package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.factory.simple.BirthdayCard;
import com.example.knowledge_sharing.common.invitation.Invitation;

public class BirthdayFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new BirthdayCard();
    }

    @Override
    public Envelope createEnvelope() {
        return new BirthdayEnvelope();
    }
}
