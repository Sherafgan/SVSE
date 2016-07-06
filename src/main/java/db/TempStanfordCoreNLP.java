package db;

import edu.stanford.nlp.simple.*;

import java.util.List;

/**
 * @author Sherafgan Kandov
 *         7/5/16.
 */
public class TempStanfordCoreNLP {
    public static void main(String[] args) {
        Sentence sentence = new Sentence("Barack Obama, the president of the USA, is playing soccer");
        sentence.nerTags();
        List<String> posTags = sentence.posTags();
        List<String> lemmas = sentence.lemmas();
        for (int i = 0; i < posTags.size(); i++) {
            if (posTags.get(i).equals("NN")) {
                System.out.println(lemmas.get(i));
            }
        }
    }
}
