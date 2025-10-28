package com.itmo.nxzage;

import lombok.extern.slf4j.Slf4j;

/**
 * Hello world!
 *
 */
@Slf4j
public class App {
    public static void main(String[] args) {
        System.setProperty("FCGI_PORT", "6827");
        Server server = new Server();
        log.info("Server initialized successfully");
        server.run();
    }
}
