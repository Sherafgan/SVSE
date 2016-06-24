package servlets;

import main.StartupPipeline;
import org.json.JSONArray;
import org.json.JSONObject;
import org.neo4j.driver.v1.*;
import org.neo4j.driver.v1.util.Function;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;

/**
 * @author Sherafgan Kandov
 *         6/19/16.
 */

public class SearchServlet extends HttpServlet {
    private static final String SEARCH_TEXT_TOKENS_FILE_NAME = "searchTxtTokens.json";

    public SearchServlet() {
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String searchText = request.getParameter("searchText");
        //BEGIN Stanford CoreNlp for processing of search text
        StartupPipeline startupPipeline = StartupPipeline.INSTANCE;
        startupPipeline.annotateText(searchText);
        //END
        //BEGIN Read search text tokens and search database
        FileReader fileReader = new FileReader(SEARCH_TEXT_TOKENS_FILE_NAME);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String line, jsonString = "";
        while ((line = bufferedReader.readLine()) != null) {
            jsonString += line;
        }
        bufferedReader.close();

        String neo4jRelationship = "";
        String neo4jObject = "";

        JSONObject jsonObject = new JSONObject(jsonString);
        JSONArray sentences = (JSONArray) jsonObject.get("sentences");
        JSONObject sentence = (JSONObject) sentences.get(0);
        JSONArray tokens = (JSONArray) sentence.get("tokens");
        for (int i = 0; i < tokens.length(); i++) {
            JSONObject token = (JSONObject) tokens.get(i);
            if (token.get("pos").equals("MD") || token.get("pos").equals("VB") || token.get("pos").equals("VBD")
                    || token.get("pos").equals("VBG") || token.get("pos").equals("VBN") || token.get("pos").equals("VBP")
                    || token.get("pos").equals("VBZ")) {
                neo4jRelationship = token.get("lemma").toString();
            } else if (token.get("pos").equals("NN") || token.get("pos").equals("NNS") || token.get("pos").equals("NNP")
                    || token.get("pos").equals("NNPS") || token.get("pos").equals("PDT") || token.get("pos").equals("POS")) {
                neo4jObject = token.get("lemma").toString();
            }
        }

        if (neo4jRelationship.length() > 1 & neo4jObject.length() > 1) {
            //BEGIN query database to retrieve data
            Session session = startupPipeline.getDbDriver().session();
            String query = "match(:PERSON)-[relation:" + neo4jRelationship + "]->(object:OBJECT) where object.name=\""
                    + neo4jObject + "\" return relation.url as URL, relation.segments as Segments";
            StatementResult result = session.run(query);
//            Map<String, List<Double>> urlToSegments = new HashMap<>();
//            Map<Integer, String> numberToUrl = new HashMap<>();
//            int j = 0;

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

//                numberToUrl.put(j, url);
//                urlToSegments.put(url, segments);
//                j++;
            }
            session.close();
            //END
            //BEGIN send urlToSegments map as JSON object to frontend
//            JSONObject urlToSegmentsJSON = new JSONObject(urlToSegments);
            response.setContentType("application/json");
            response.setCharacterEncoding("utf-8");
            String JsonArrayToWrite = finalJsonArray.toString();
            response.getWriter().write(JsonArrayToWrite);
//            response.setStatus(HttpServletResponse.SC_OK);
            //END
        }
        //END
    }
}
