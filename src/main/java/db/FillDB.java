package db;

import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import org.json.JSONArray;
import org.json.JSONObject;
import org.neo4j.driver.v1.*;

import java.io.*;
import java.util.*;

/**
 * @author Sherafgan Kandov
 *         6/18/16.
 */
public class FillDB {
    private static final String DATASET_FILE_NAME = "/home/sherafgan/Downloads/activity_net.v1-3.min.json";
    private static final String ANNOTATIONS_ARRAY_FILE_NAME = "AnnotationsDatasetArray.json";

    public static void main(String[] args) throws IOException {
//        parseDatasetTo(DATASET_FILE_NAME, ANNOTATIONS_ARRAY_FILE_NAME);

        FileReader fileReader = new FileReader(ANNOTATIONS_ARRAY_FILE_NAME);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String annotationsString = bufferedReader.readLine();
        bufferedReader.close();

        JSONArray video_info_array = new JSONArray(annotationsString);
        for (int i = 0; i < video_info_array.length(); i++) {
            HashMap<String, List<Double>> labelToSegments = new HashMap<>();

            JSONObject video_info_object = (JSONObject) video_info_array.get(i);
            JSONArray annotations = (JSONArray) video_info_object.get("annotations");
            for (int j = 0; j < annotations.length(); j++) {
                JSONObject annotation = (JSONObject) annotations.get(j);

                String label = annotation.getString("label");
                List<Double> segments = new LinkedList<>();

                JSONArray segment = (JSONArray) annotation.get("segment");
                for (int k = 0; k < segment.length(); k++) {
                    segments.add(segment.getDouble(k));
                }
                //segments and label are ready
                if (labelToSegments.get(label) == null) {
                    labelToSegments.put(label, segments);
                } else {
                    for (double s : segments) {
                        labelToSegments.get(label).add(s);
                    }
                }
            }

            //Annotating labels and writing to JSONs
            int l = 0;
            Set<String> labels = labelToSegments.keySet();
            for (String label : labels) {
                annotateLabel(label, l);
                l++;
            }

            int c = 0;
            Iterator iterator = labelToSegments.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry pair = (Map.Entry) iterator.next();

                String neo4jRelationship = " ";
                String neo4jObject = " ";

                FileReader fileReader1 = new FileReader("annotatedJSONs/jsonOutput" + c + ".json");
                BufferedReader bufferedReader1 = new BufferedReader(fileReader1);
                String line, finalLine = "";
                while ((line = bufferedReader1.readLine()) != null) {
                    finalLine += line;
                }
                bufferedReader1.close();
                JSONObject jsonObject = new JSONObject(finalLine);
                JSONArray sentences = (JSONArray) jsonObject.get("sentences");
                JSONObject sentence = (JSONObject) sentences.get(0);
                JSONArray tokens = (JSONArray) sentence.get("tokens");
                for (int q = 0; q < tokens.length(); q++) {
                    JSONObject token = (JSONObject) tokens.get(q);
                    if (token.get("pos").equals("MD") || token.get("pos").equals("VB") || token.get("pos").equals("VBD")
                            || token.get("pos").equals("VBG") || token.get("pos").equals("VBN") || token.get("pos").equals("VBP")
                            || token.get("pos").equals("VBZ")) {
                        neo4jRelationship = token.get("lemma").toString();
                    } else if (token.get("pos").equals("NN") || token.get("pos").equals("NNS") || token.get("pos").equals("NNP")
                            || token.get("pos").equals("NNPS") || token.get("pos").equals("PDT") || token.get("pos").equals("POS")) {
                        neo4jObject = token.get("lemma").toString();
                    }
                }
                queryDataToDB(neo4jRelationship, neo4jObject, video_info_object, labelToSegments, (String) pair.getKey());

                c++;
            }
        }
    }

    private static void queryDataToDB(String rel, String obj, JSONObject video_info_object, HashMap<String, List<Double>> labelToSegment, String label) {
        Driver driver = GraphDatabase.driver("bolt://localhost", AuthTokens.basic("neo4j", "smth"));
        Session session = driver.session();
        String query = "create(:Person)-[:" + rel + "{url:\"" + video_info_object.get("url") + "\"," + "segments:" + labelToSegment.get(label) + "}"
                + "]->(:Object{name:\"" + obj + "\"})";
        session.run(query);

//        StatementResult result = session.run("MATCH (a:Person) WHERE a.name = 'Arthur' RETURN a.name AS name, a.title AS title");
//        while (result.hasNext()) {
//            Record record = result.next();
//            System.out.println(record.get("title").asString() + " " + record.get("name").asString());
//        }
        session.close();
        driver.close();
    }

    private static void annotateLabel(String label, int annotationNum) throws IOException {
        PrintWriter jsonOut = new PrintWriter("annotatedJSONs/jsonOutput" + annotationNum + ".json");
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize, ssplit, pos, lemma, ner, parse");
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
        Annotation annotation = new Annotation(label);
        pipeline.annotate(annotation);
        pipeline.jsonPrint(annotation, jsonOut);
        jsonOut.flush();
        jsonOut.close();
    }

    private static void parseDatasetTo(String datasetFileName, String parsedArrayOfAnnotations) {
        try {
            FileReader fileReader = new FileReader(datasetFileName);
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            String jsonString = bufferedReader.readLine();
            bufferedReader.close();
            JSONObject jsonObject = new JSONObject(jsonString);
            JSONObject databaseObject = jsonObject.getJSONObject("database");

            JSONArray annotationsArray = new JSONArray();
            Set<String> keysOfDbObject = databaseObject.keySet();
            for (String key : keysOfDbObject) {
                annotationsArray.put(databaseObject.get(key));
            }

            FileWriter fileWriter = new FileWriter(parsedArrayOfAnnotations);
            BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
            bufferedWriter.write(annotationsArray.toString());
            bufferedWriter.flush();
            bufferedWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
