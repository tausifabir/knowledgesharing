package com.example.knowledge_sharing.factory.method;

import com.example.knowledge_sharing.factory.simple.BirthdayCard;
import com.example.knowledge_sharing.common.invitation.Invitation;

public class BirthdayEvent extends InvitationEvent.InvitingEvent {
    @Override
    protected Invitation createInvitation() {
        return new BirthdayCard();
    }
}
