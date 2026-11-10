package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.factory.simple.BirthdayInvitation;
import com.example.knowledge_sharing.factory.simple.Invitation;

public class BirthdayFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new BirthdayInvitation();
    }

    @Override
    public Envelope createEnvelope() {
        return new BirthdayEnvelope();
    }
}
