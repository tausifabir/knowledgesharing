package com.example.knowledge_sharing.singleton;

public class Whiteboard {

    private static final Whiteboard INSTANCE = new Whiteboard();

    private volatile String text = ""; // Publish writes to every thread using the shared instance.

    private Whiteboard() {}

    public static Whiteboard getInstance() {
        return INSTANCE;
    }

    public void write(String message) {
        text = message;
    }

    public String read() {
        return text;
    }
}
