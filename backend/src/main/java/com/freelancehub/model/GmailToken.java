package com.freelancehub.model;

public class GmailToken {
    private int id;
    private String accessToken;
    private String refreshToken;
    private long tokenExpiry;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public long getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(long tokenExpiry) { this.tokenExpiry = tokenExpiry; }
}
