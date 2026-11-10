package com.example.knowledge_sharing.factory.method;

import com.example.knowledge_sharing.factory.simple.Invitation;
import com.example.knowledge_sharing.factory.simple.WeddingInvitation;

public class WeddingEvent extends InvitationEvent.InvitingEvent {
    @Override
    protected Invitation createInvitation() {
        return new WeddingInvitation();
    }
}
