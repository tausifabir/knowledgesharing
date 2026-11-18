package com.example.knowledge_sharing.factory.abstraction;

import com.example.knowledge_sharing.common.invitation.Invitation;
import com.example.knowledge_sharing.factory.simple.MembershipCard;

public class MembershipFactory implements EventFactory {
    @Override
    public Invitation createInvitation() {
        return new MembershipCard();
    }

    @Override
    public Envelope createEnvelope() {
        return new MembershipEnvelope();
    }
}
