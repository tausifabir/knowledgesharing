package com.example.knowledge_sharing.prototype;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvitationCard {
    private String guestName;      // String is immutable
    private StringBuilder message; // StringBuilder is mutable

    public InvitationCard(String guestName, StringBuilder message) {
        this.guestName = guestName;
        this.message = message;
    }

    // New card, but message object stays shared
    public InvitationCard shallowCopy() {
        return new InvitationCard(guestName, message);
    }

    // New card AND new message object
    public InvitationCard deepCopy() {
        return new InvitationCard(
                guestName,
                new StringBuilder(message)
        );
    }
}
