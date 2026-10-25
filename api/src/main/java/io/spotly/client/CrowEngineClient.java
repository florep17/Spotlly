package io.spotly.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class CrowEngineClient {

    private final WebClient webClient;

    public CrowEngineClient(WebClient.Builder webClientBuilder,
                            @Value("${spotly.search-engine.base-url:http://localhost:8080}") String engineBaseUrl) {
        this.webClient = webClientBuilder.baseUrl(engineBaseUrl).build();
    }

    public WebClient getWebClient() {
        return webClient;
    }
}
