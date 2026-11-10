package com.example.knowledge_sharing.factory.method;

import com.example.knowledge_sharing.factory.simple.BirthdayInvitation;
import com.example.knowledge_sharing.factory.simple.Invitation;

public class BirthdayEvent extends InvitationEvent.InvitingEvent {
    @Override
    protected Invitation createInvitation() {
        return new BirthdayInvitation();
    }
}
