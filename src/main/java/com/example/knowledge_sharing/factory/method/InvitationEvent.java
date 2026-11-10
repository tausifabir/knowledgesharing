package com.example.knowledge_sharing.factory.method;

import com.example.knowledge_sharing.factory.simple.Invitation;

public class InvitationEvent {

    public static abstract class InvitingEvent {

        protected abstract Invitation createInvitation();

        public String prepareInvitation() {
            Invitation invitation = createInvitation();
            return "Prepared: " + invitation.message();
        }
    }

}
