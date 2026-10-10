package com.campusnest;

import com.campusnest.config.SpaWebConfig;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class SpaRoutingTest {

    private SpaWebConfig spaWebConfig;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        spaWebConfig = new SpaWebConfig();
        request = Mockito.mock(HttpServletRequest.class);
    }

    @Test
    @DisplayName("Should forward non-API frontend route /admin/login to /index.html")
    void shouldForwardAdminLoginRouteToIndexHtml() {
        when(request.getRequestURI()).thenReturn("/admin/login");

        ModelAndView modelAndView = spaWebConfig.resolveErrorView(request, HttpStatus.NOT_FOUND, Collections.emptyMap());

        assertNotNull(modelAndView, "ModelAndView must not be null for SPA route");
        assertEquals("forward:/index.html", modelAndView.getViewName());
        assertEquals(HttpStatus.OK, modelAndView.getStatus());
    }

    @Test
    @DisplayName("Should forward nested frontend route /student/dashboard to /index.html")
    void shouldForwardStudentDashboardRouteToIndexHtml() {
        when(request.getRequestURI()).thenReturn("/student/dashboard");

        ModelAndView modelAndView = spaWebConfig.resolveErrorView(request, HttpStatus.NOT_FOUND, Collections.emptyMap());

        assertNotNull(modelAndView);
        assertEquals("forward:/index.html", modelAndView.getViewName());
        assertEquals(HttpStatus.OK, modelAndView.getStatus());
    }

    @Test
    @DisplayName("Should NOT forward missing API routes (/api/books/999) to index.html")
    void shouldNotForwardMissingApiRoutes() {
        when(request.getRequestURI()).thenReturn("/api/books/999");

        ModelAndView modelAndView = spaWebConfig.resolveErrorView(request, HttpStatus.NOT_FOUND, Collections.emptyMap());

        assertNull(modelAndView, "API 404s must not be resolved to index.html");
    }

    @Test
    @DisplayName("Should NOT forward missing file upload paths (/uploads/missing.pdf) to index.html")
    void shouldNotForwardMissingUploadPaths() {
        when(request.getRequestURI()).thenReturn("/uploads/missing.pdf");

        ModelAndView modelAndView = spaWebConfig.resolveErrorView(request, HttpStatus.NOT_FOUND, Collections.emptyMap());

        assertNull(modelAndView, "Upload 404s must not be resolved to index.html");
    }

    @Test
    @DisplayName("Should NOT forward missing static asset files with extensions (/assets/chunk.js) to index.html")
    void shouldNotForwardMissingStaticAssetFilesWithExtension() {
        when(request.getRequestURI()).thenReturn("/assets/chunk.js");

        ModelAndView modelAndView = spaWebConfig.resolveErrorView(request, HttpStatus.NOT_FOUND, Collections.emptyMap());

        assertNull(modelAndView, "Static assets with extensions must return 404, not HTML");
    }

    @Test
    @DisplayName("Should NOT forward 500 internal server errors")
    void shouldNotForward500Errors() {
        when(request.getRequestURI()).thenReturn("/admin/login");

        ModelAndView modelAndView = spaWebConfig.resolveErrorView(request, HttpStatus.INTERNAL_SERVER_ERROR, Collections.emptyMap());

        assertNull(modelAndView, "Non-404 errors must not be handled by SPA forwarder");
    }
}
