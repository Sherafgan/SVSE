package main;

import edu.stanford.nlp.simple.*;
import org.neo4j.driver.v1.AuthTokens;
import org.neo4j.driver.v1.Driver;
import org.neo4j.driver.v1.GraphDatabase;

import java.io.IOException;

/**
 * @author Sherafgan Kandov
 *         6/19/16.
 */

public class StartupPipeline {
    //local neo4j password set  by user or default otherwise
    private static final String NEO4J_PASSWORD = "smth";

    public static final StartupPipeline INSTANCE = new StartupPipeline();
    private static Driver dbDriver;

    public void load() throws IOException {
        Sentence sentence = new Sentence("I saw cat in the hat.");
        sentence.posTags();
        dbDriver = GraphDatabase.driver("bolt://localhost", AuthTokens.basic("neo4j", NEO4J_PASSWORD));
    }

    public Driver getDbDriver() {
        return dbDriver;
    }
}
