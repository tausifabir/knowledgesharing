package com.example.knowledge_sharing.factory.simple;

import com.example.knowledge_sharing.common.invitation.Invitation;

public class GiftCard implements Invitation {
    @Override
    public String message() {
        return "Gift invitation";
    }
}
