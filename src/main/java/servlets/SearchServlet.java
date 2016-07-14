package servlets;

import edu.stanford.nlp.simple.*;
import main.StartupPipeline;
import org.json.*;
import org.neo4j.driver.v1.*;
import org.neo4j.driver.v1.util.Function;

import javax.servlet.http.*;
import java.io.IOException;
import java.util.*;

/**
 * @author Sherafgan Kandov
 *         6/19/16.
 */

public class SearchServlet extends HttpServlet {
    private static final String SEARCH_TEXT_TOKENS_FILE_NAME = "searchTxtTokens.json";
    private static Set<String> neo4jRels;
    private static Set<String> neo4jObjs;

    public SearchServlet() {
        String[] neo4jRelsArray = new String[]{"MD", "VB", "VBD", "VBG", "VBN", "VBP", "VBZ"};
        String[] neo4jObjsArray = new String[]{"NN", "NNS", "NNP", "NNPS", "PDT", "POS"};

        neo4jRels = new HashSet<>();
        neo4jObjs = new HashSet<>();

        for (String rel : neo4jRelsArray) {
            neo4jRels.add(rel);
        }
        for (String obj : neo4jObjsArray) {
            neo4jObjs.add(obj);
        }
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String searchText = request.getParameter("searchText");
        //BEGIN Stanford CoreNlp for processing of search text
        StartupPipeline startupPipeline = StartupPipeline.INSTANCE;
        Sentence nlpSentence = new Sentence(searchText);
        //END

        //BEGIN Read search text tokens and search database
        String neo4jRelationship = "";
        String neo4jObject = "";

        List<String> posTags = nlpSentence.posTags();
        List<String> lemmas = nlpSentence.lemmas();

        for (int i = 0; i < posTags.size(); i++) {
            if (neo4jRels.contains(posTags.get(i))) {
                neo4jRelationship = lemmas.get(i);
            } else if (neo4jObjs.contains(posTags.get(i))) {
                neo4jObject = lemmas.get(i);
            }
        }

        if (neo4jRelationship.length() > 1) {
            //BEGIN query database to retrieve data
            Session session = startupPipeline.getDbDriver().session();
            String query = "";
            if (neo4jRelationship.length() > 1 & neo4jObject.length() > 1) {
                query = "match(:PERSON)-[relation:" + neo4jRelationship + "]->(object:OBJECT) where object.name=\""
                        + neo4jObject + "\" return relation.url as URL, relation.segments as Segments";
            } else if (neo4jRelationship.length() > 1 & neo4jObject.length() == 0) {
                query = "match(:PERSON)-[relation:" + neo4jRelationship +
                        "]->() return relation.url as URL, relation.segments as Segments";
            }
            StatementResult result = session.run(query);

            JSONArray finalJsonArray = new JSONArray();
            while (result.hasNext()) {
                Record record = result.next();
                String url = record.get("URL").asString();
                List<Double> segments = record.get("Segments").asList(new Function<Value, Double>() {
                    @Override
                    public Double apply(Value value) {
                        return value.asDouble();
                    }
                });
                JSONObject urlAndSegments = new JSONObject();
                urlAndSegments.append("url", url)
                        .append("segments", segments.toArray());
                finalJsonArray.put(urlAndSegments);

            }
            session.close();
            //END

            //BEGIN send urlToSegments map as JSON object to frontend
            response.setContentType("application/json");
            response.setCharacterEncoding("utf-8");
            String JsonArrayToWrite = finalJsonArray.toString();
            response.getWriter().write(JsonArrayToWrite);
            response.setStatus(HttpServletResponse.SC_OK);
            //END
        }
        //END
    }
}
