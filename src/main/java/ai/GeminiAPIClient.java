package ai;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Properties;

public class GeminiAPIClient {

    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private final String apiKey;
    private final HttpClient httpClient;

    public GeminiAPIClient() {
        this.apiKey = loadApiKey();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    private String loadApiKey() {
        Properties props = new Properties();
        try (InputStream is = loadConfig()) {
            props.load(is);
            String key = props.getProperty("gemini.api.key");
            if (key == null || key.isBlank() || key.equals("YOUR_GEMINI_API_KEY")) {
                throw new RuntimeException("Gemini API key not configured in config.properties");
            }
            return key;
        } catch (IOException e) {
            throw new RuntimeException("Could not load config.properties", e);
        }
    }

    private static InputStream loadConfig() throws IOException {
        File file = new File("config.properties");
        if (file.exists()) {
            return new FileInputStream(file);
        }
        InputStream is = GeminiAPIClient.class.getClassLoader().getResourceAsStream("config.properties");
        if (is != null) {
            return is;
        }
        throw new IOException("config.properties not found on filesystem or classpath");
    }

    public String generateContent(String prompt) throws IOException, InterruptedException {
        JsonObject requestBody = buildRequestBody(prompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .timeout(Duration.ofSeconds(60))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("Gemini API error: " + response.statusCode() + " - " + response.body());
        }

        return parseResponse(response.body());
    }

    private JsonObject buildRequestBody(String prompt) {
        JsonObject part = new JsonObject();
        part.addProperty("text", prompt);

        JsonArray parts = new JsonArray();
        parts.add(part);

        JsonObject content = new JsonObject();
        content.add("parts", parts);

        JsonArray contents = new JsonArray();
        contents.add(content);

        JsonObject body = new JsonObject();
        body.add("contents", contents);

        return body;
    }

    private String parseResponse(String json) {
        JsonObject root = JsonParser.parseString(json).getAsJsonObject();

        String text = root
                .getAsJsonArray("candidates")
                .get(0).getAsJsonObject()
                .getAsJsonObject("content")
                .getAsJsonArray("parts")
                .get(0).getAsJsonObject()
                .get("text")
                .getAsString();

        return text.trim();
    }
}
