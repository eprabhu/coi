package com.polus.fibicomp.logs;

import com.polus.core.roles.dao.PersonRoleRightDao;
import com.polus.core.security.AuthenticatedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/logs")
public class LogController {

    @Value("${app.log.dir:logs}")
    private String LOG_DIR;

    @Autowired
    private PersonRoleRightDao personRoleRightDao;

    @GetMapping(value = "/{serviceName}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getLogs(
            @PathVariable String serviceName,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "desc") String order
    ) throws IOException {

        if(!personRoleRightDao.isPersonHasPermission(AuthenticatedUser.getLoginPersonId(), "APPLICATION_ADMINISTRATOR", null)) {
            return "You do not have permission to access logs.";
        }

        Path logFile = Paths.get(LOG_DIR, serviceName + ".log");

        if (!Files.exists(logFile)) {
            return "Log file not found: " + logFile;
        }

        Stream<String> lines = Files.lines(logFile);

        // Filter by search keyword if provided
        if (!search.isEmpty()) {
            lines = lines.filter(line -> line.toLowerCase().contains(search.toLowerCase()));
        }

        // Collect lines
        List<String> logList = lines.collect(Collectors.toList());
        lines.close();

        // Order lines
        if ("desc".equalsIgnoreCase(order)) {
            Collections.reverse(logList);
        }

        // Limit lines
        logList = logList.stream().limit(limit).collect(Collectors.toList());

        // Join lines as plain text
        return String.join("\n", logList);
    }
}
