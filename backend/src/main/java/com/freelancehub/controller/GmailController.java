package com.freelancehub.controller;

import com.freelancehub.service.GmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gmail")
public class GmailController {

    private final GmailService gmailService;

    public GmailController(GmailService gmailService) {
        this.gmailService = gmailService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        if (!gmailService.isConfigured()) {
            return ResponseEntity.ok(Map.of(
                    "connected", false,
                    "error", "Gmail API not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            ));
        }
        return ResponseEntity.ok(Map.of("connected", gmailService.isConnected()));
    }

    @GetMapping("/auth")
    public ResponseEntity<?> getAuthUrl() {
        if (!gmailService.isConfigured()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Gmail API not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            ));
        }
        return ResponseEntity.ok(Map.of("url", gmailService.getAuthUrl()));
    }

    @GetMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestParam String code) {
        try {
            gmailService.handleCallback(code);
            return ResponseEntity.ok(
                    "<html><body style='display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0f172a;color:#e2e8f0;'><div style='text-align:center'><h1 style='color:#4ade80'>✓ Gmail Connected!</h1><p>You can close this tab and return to FreelanceHub.</p></div></body></html>"
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/draft")
    public ResponseEntity<?> createDraft(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String subject = request.get("subject");
        String body = request.get("body");

        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient email is required"));
        }
        if (subject == null) subject = "";
        if (body == null) body = "";

        try {
            boolean ok = gmailService.createDraft(to.trim(), subject, body);
            if (!ok) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to create Gmail draft"));
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Draft created in Gmail!"));
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("invalid_grant")) {
                return ResponseEntity.status(401).body(Map.of(
                        "error", "Gmail authorization expired. Please reconnect.",
                        "reconnect", true
                ));
            }
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create draft: " + msg));
        }
    }
}
