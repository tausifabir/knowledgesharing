package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.factory.simple.Invitation;

public interface EventFactory {
    Invitation createInvitation();
    Envelope createEnvelope();

    static String prepareMatchingSet(EventFactory factory) {
        return factory.createInvitation().message()
                + " + " + factory.createEnvelope().description();
    }
}
