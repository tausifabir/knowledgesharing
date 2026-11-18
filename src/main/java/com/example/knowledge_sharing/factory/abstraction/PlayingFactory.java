package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.common.invitation.Invitation;
import com.example.knowledge_sharing.factory.simple.PlayingCard;

public class PlayingFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new PlayingCard();
    }

    @Override
    public Envelope createEnvelope() {
        return new PlayingEnvelope();
    }
}
