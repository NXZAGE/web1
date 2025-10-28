package com.itmo.nxzage;

import java.net.ResponseCache;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import com.fastcgi.FCGIInterface;
import com.itmo.nxzage.communication.Request;
import com.itmo.nxzage.communication.RequestParser;
import com.itmo.nxzage.communication.Response;
import com.itmo.nxzage.communication.Response.Status;
import com.itmo.nxzage.exceptions.ValidationException;
import com.itmo.nxzage.models.Point;
import com.itmo.nxzage.validation.RequestValidator;
import com.itmo.nxzage.validation.Validator;
import lombok.extern.slf4j.Slf4j;

/**
 * Simple FCGI Server
 */
@Slf4j
public final class Server {
    private final FCGIInterface fcgi;
    private final RequestParser parser;
    private final PointInRegionService figureService;
    private final Validator<Request> requestValidator;
    private long requestAcceptedStamp;
    private boolean running;

    public Server() {
        fcgi = new FCGIInterface();
        parser = new RequestParser();
        figureService = new PointInRegionService();
        requestValidator = new RequestValidator();
        initFigureService();
    }

    public void run() {
        running = true;
        while (running && fcgi.FCGIaccept() >= 0) {
            log.debug("Ready to accept request");
            requestAcceptedStamp = System.nanoTime();
            processRequst();
        }
        log.error("Server is not running: escaped from while");
    }

    public Response buildCorrectResponse(Request request) {
        if (request.getMethod().equals("OPTIONS")) {
            return buildOptionsResponse();
        }
        try {
            requestValidator.validate(request);
        } catch (ValidationException e) {
            log.error("Validation exception :" + e.getMessage(), e);
            return buildErrorResposne(Status.BAD_REQUEST,
                    "Validation failed: %s".formatted(e.getMessage()));
        }
        if (request.getMethod().equals("POST")) {
            // TODO important add validation
            Point point;
            double r;
            boolean hit;
            try {
                Double x = (Double) request.getArgs().get("x");
                Double y = (Double) request.getArgs().get("y");
                r = (Double) request.getArgs().get("r");
                point = new Point(x, y);
                hit = figureService.regionContainsPoint(point, r);
            } catch (Exception e) {
                log.error(e.getMessage());
                return buildErrorResposne(Status.INTERNAL_SERVER_ERROR);
            }
            long executionTime = (System.nanoTime() - requestAcceptedStamp) / 1_000_000;
            String timeStamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now());
            var body =
                    "{\n  \"hit\": %b,\n \"execution_time\": \"%d ms\",\n  \"timestamp\": \"%s\"\n}"
                            .formatted(hit, executionTime, timeStamp);
            return Response.builder().body(body).status(Status.OK).build().header("Content-Type",
                    "application/json");
        } else
            return buildErrorResposne(Status.METHOD_NOT_ALLOWED);
    }

    public Response buildOptionsResponse() {
        return Response.builder().status(Status.OK).build()
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "POST, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type");
    }

    public Response buildErrorResposne(Status status) {
        return buildErrorResposne(status, status.getMessage());
    }

    public Response buildErrorResposne(Status status, String message) {
        String body =
                "{\n  \"status\": \"%s\",\n  \"status_code\": %d,\n  \"error_message\": \"%s\"\n}".formatted(status.getMessage(), status.getCode(), message);
        return Response.builder().status(status).body(body).build().header("Content-Type",
                "application/json");
    }

    public void processRequst() {
        log.debug("Commenced processing request");
        try {
            Request request = parser.parse(FCGIInterface.request);
            log.debug("Request parsed");
            Response response = buildCorrectResponse(request);
            log.debug("Expected response built");
            response.send();
            log.debug("Response sent");
        } catch (Exception e) {
            log.error("Error duaring request processing", e);
            buildErrorResposne(Status.BAD_REQUEST, e.getMessage()).send();
            log.debug("Error response sent");
        }
    }

    private void initFigureService() {
        figureService
                .addRegion((p, r) -> (p.y() >= 0 && p.y() <= r && p.x() >= 0 && p.x() <= r / 2));
        figureService.addRegion(
                (p, r) -> (p.y() >= 0 && p.y() <= r && p.x() <= 0 && p.y() < p.x() * 2 + r));
        figureService.addRegion((p, r) -> (p.x() <= 0 && p.y() <= 0
                && p.x() * p.x() + p.y() * p.y() <= (r / 2) * (r / 2)));
    }
}
