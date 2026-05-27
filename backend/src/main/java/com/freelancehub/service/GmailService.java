package com.freelancehub.service;

import com.freelancehub.dao.GmailTokenDAO;
import com.freelancehub.model.GmailToken;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Properties;
import java.util.stream.Collectors;

@Service
public class GmailService {

    private static final String AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me/drafts";

    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final GmailTokenDAO tokenDAO;
    private final HttpClient httpClient;
    private final Gson gson;

    public GmailService(
            @Value("${google.client.id}") String clientId,
            @Value("${google.client.secret}") String clientSecret,
            @Value("${google.redirect.uri}") String redirectUri,
            GmailTokenDAO tokenDAO) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.tokenDAO = tokenDAO;
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public boolean isConfigured() {
        return !clientId.isEmpty() && !clientSecret.isEmpty();
    }

    public boolean isConnected() {
        return isConfigured() && tokenDAO.get().isPresent();
    }

    public String getAuthUrl() {
        return AUTH_URL + "?" +
                "client_id=" + encode(clientId) +
                "&redirect_uri=" + encode(redirectUri) +
                "&response_type=code" +
                "&scope=" + encode("https://www.googleapis.com/auth/gmail.compose") +
                "&access_type=offline" +
                "&prompt=consent";
    }

    public void handleCallback(String code) throws Exception {
        String body = "code=" + encode(code) +
                "&client_id=" + encode(clientId) +
                "&client_secret=" + encode(clientSecret) +
                "&redirect_uri=" + encode(redirectUri) +
                "&grant_type=authorization_code";

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(TOKEN_URL))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        JsonObject json = gson.fromJson(res.body(), JsonObject.class);

        if (json.has("error")) {
            throw new RuntimeException("OAuth error: " + json.get("error").getAsString());
        }

        GmailToken token = new GmailToken();
        token.setAccessToken(json.get("access_token").getAsString());
        token.setRefreshToken(json.has("refresh_token") ? json.get("refresh_token").getAsString() : "");
        token.setTokenExpiry(System.currentTimeMillis() + (json.get("expires_in").getAsLong() * 1000));
        tokenDAO.save(token);
    }

    public boolean createDraft(String to, String subject, String body) throws Exception {
        GmailToken token = tokenDAO.get().orElse(null);
        if (token == null) return false;

        if (System.currentTimeMillis() >= token.getTokenExpiry()) {
            refreshAccessToken(token);
        }

        String rawEmail = buildRawEmail(to, subject, body);
        String encoded = Base64.getUrlEncoder().encodeToString(rawEmail.getBytes(StandardCharsets.UTF_8));

        JsonObject message = new JsonObject();
        message.addProperty("raw", encoded);
        JsonObject payload = new JsonObject();
        payload.add("message", message);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(GMAIL_API))
                .header("Authorization", "Bearer " + token.getAccessToken())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
                .build();

        HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        return res.statusCode() >= 200 && res.statusCode() < 300;
    }

    private void refreshAccessToken(GmailToken token) throws Exception {
        String body = "client_id=" + encode(clientId) +
                "&client_secret=" + encode(clientSecret) +
                "&refresh_token=" + encode(token.getRefreshToken()) +
                "&grant_type=refresh_token";

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(TOKEN_URL))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        JsonObject json = gson.fromJson(res.body(), JsonObject.class);

        if (json.has("error")) {
            tokenDAO.deleteAll();
            throw new RuntimeException("Token refresh failed: " + json.get("error").getAsString());
        }

        token.setAccessToken(json.get("access_token").getAsString());
        token.setTokenExpiry(System.currentTimeMillis() + (json.get("expires_in").getAsLong() * 1000));
        tokenDAO.save(token);
    }

    private String buildRawEmail(String to, String subject, String body) throws Exception {
        MimeMessage msg = new MimeMessage(Session.getDefaultInstance(new Properties()));
        msg.setFrom(new InternetAddress("me"));
        msg.setRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
        msg.setSubject(subject, "UTF-8");
        msg.setText(body, "UTF-8");
        msg.saveChanges();

        try (var os = new java.io.ByteArrayOutputStream()) {
            msg.writeTo(os);
            return os.toString(StandardCharsets.UTF_8);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
