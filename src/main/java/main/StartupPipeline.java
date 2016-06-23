package main;

import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import org.neo4j.driver.v1.AuthTokens;
import org.neo4j.driver.v1.Driver;
import org.neo4j.driver.v1.GraphDatabase;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Properties;

public class StartupPipeline {
    public static final StartupPipeline INSTANCE = new StartupPipeline();

    private static StanfordCoreNLP pipeline;
    private static Driver dbDriver;

    public void load() throws IOException {
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize, ssplit, pos, lemma, ner, parse");
        pipeline = new StanfordCoreNLP(props);
        Annotation annotation = new Annotation("DEFAULT");
        pipeline.annotate(annotation);
        PrintWriter jsonOut = new PrintWriter("searchTxtTokens.json");
        pipeline.jsonPrint(annotation, jsonOut);
        dbDriver = GraphDatabase.driver("bolt://localhost", AuthTokens.basic("neo4j", "smth"));
    }

    public void annotateText(String text) throws IOException {
        Annotation annotation = new Annotation(text);
        pipeline.annotate(annotation);
        PrintWriter jsonOut = new PrintWriter("searchTxtTokens.json");
        pipeline.jsonPrint(annotation, jsonOut);
    }

    public Driver getDbDriver() {
        return dbDriver;
    }
}
