package com.itmo.nxzage;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import com.fastcgi.FCGIInterface;
import lombok.extern.slf4j.Slf4j;

/**
 * Hello world!
 *
 */
@Slf4j
public class App {
    public static void main(String[] args) {
        //log.info("Penis pizda LOGGG");
        System.setProperty("FCGI_PORT", "7615");
        Server server = new Server();
        server.run();
    }
}
