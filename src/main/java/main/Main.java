package main;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import servlets.SearchServlet;

/**
 * @author Sherafgan Kandov
 *         6/19/16.
 */

public class Main {
    public static void main(String[] args) throws Exception {
        StartupPipeline startupPipeline = StartupPipeline.INSTANCE;
        startupPipeline.load();

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.addServlet(new ServletHolder(new SearchServlet()), "/search");

        ResourceHandler resource_handler = new ResourceHandler();
        resource_handler.setResourceBase("src/main/resources");

        HandlerList handlers = new HandlerList();
        handlers.setHandlers(new Handler[]{resource_handler, context});

        Server server = new Server(8080);
        server.setHandler(handlers);

        server.start();
//        server.join();
    }
}
