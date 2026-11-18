package com.example.knowledge_sharing;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {
    @GetMapping("/")
    public String dashboard() {
        return "forward:/patterns.html";
    }
}
