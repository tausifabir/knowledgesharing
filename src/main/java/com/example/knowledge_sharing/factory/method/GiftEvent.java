package com.example.knowledge_sharing.factory.method;

import com.example.knowledge_sharing.common.invitation.Invitation;
import com.example.knowledge_sharing.factory.simple.GiftCard;

public class GiftEvent extends InvitationEvent.InvitingEvent {
    @Override
    protected Invitation createInvitation() {
        return new GiftCard();
    }
}
