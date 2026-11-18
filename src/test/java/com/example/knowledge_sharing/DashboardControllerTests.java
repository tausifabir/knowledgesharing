package com.example.knowledge_sharing;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DashboardControllerTests {
    @Test
    void rootForwardsToPatternDashboard() throws Exception {
        MockMvcBuilders.standaloneSetup(new DashboardController()).build()
                .perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/patterns.html"));
    }
}
