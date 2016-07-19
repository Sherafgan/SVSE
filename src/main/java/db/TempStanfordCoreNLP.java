package db;

import edu.stanford.nlp.semgraph.SemanticGraph;
import edu.stanford.nlp.simple.*;

import java.util.List;

/**
 * @author Sherafgan Kandov
 *         7/5/16.
 */
public class TempStanfordCoreNLP {
    public static void main(String[] args) {
        Sentence sentence = new Sentence("playing ice hockey");
        SemanticGraph graph = sentence.dependencyGraph();
        System.out.println();
    }
}
