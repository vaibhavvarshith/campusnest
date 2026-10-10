package com.campusnest.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

import java.util.Collections;
import java.util.Map;

/**
 * Handles client-side Single Page Application (SPA) routing for React Router.
 * When a user refreshes or directly navigates to a frontend route (e.g., /admin/login, /student/dashboard),
 * this resolver forwards the request to /index.html instead of returning a 404 Whitelabel error.
 * REST API routes (/api/**), file uploads (/uploads/**), and static files with extensions are bypassed.
 */
@Configuration
public class SpaWebConfig implements ErrorViewResolver {

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        if (status == HttpStatus.NOT_FOUND) {
            String path = request.getRequestURI();
            // Do not forward API endpoints, uploaded files, or asset files with dot extensions
            if (!path.startsWith("/api") && !path.startsWith("/uploads") && !hasFileExtension(path)) {
                return new ModelAndView("forward:/index.html", Collections.emptyMap(), HttpStatus.OK);
            }
        }
        return null;
    }

    private boolean hasFileExtension(String path) {
        int lastSlash = path.lastIndexOf('/');
        int lastDot = path.lastIndexOf('.');
        return lastDot > lastSlash && lastDot < path.length() - 1;
    }
}
