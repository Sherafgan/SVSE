package db;

import edu.stanford.nlp.simple.Sentence;
import org.json.*;
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
    private static final String PATH_TO_CQL_DUMP = "/home/sherafgan/IdeaProjects/SVSE/va_cql_dump.cql";

    public static void main(String[] args) throws IOException {
        FileReader fileReader = new FileReader(ANNOTATIONS_ARRAY_FILE_NAME);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        String annotationsString = bufferedReader.readLine();
        bufferedReader.close();

        JSONArray video_info_array = new JSONArray(annotationsString);

        FileWriter fileWriter = new FileWriter("va_cql_dump.cql");
        BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);

        int totalNumberOfLabelsOfAnnotations = 0;
        int succeedLabelsOfAnnotations = 0;

        //BEGIN Neo4j driver session
        Driver driver = GraphDatabase.driver("bolt://localhost", AuthTokens.basic("neo4j", "smth"));
        Session session = driver.session();
        //END

        String[] neo4jRelsArray = new String[]{"MD", "VB", "VBD", "VBG", "VBN", "VBP", "VBZ"};
        String[] neo4jObjsArray = new String[]{"NN", "NNS", "NNP", "NNPS", "PDT", "POS"};

        Set<String> neo4jRels = new HashSet<>();
        Set<String> neo4jObjs = new HashSet<>();

        for (String rel : neo4jRelsArray) {
            neo4jRels.add(rel);
        }
        for (String obj : neo4jObjsArray) {
            neo4jObjs.add(obj);
        }

        //Writing out unparsed data for analyse
        FileWriter fileWriterForUnparsedAnnotations = new FileWriter("UnparsedAnnotations.txt");
        BufferedWriter bufferedWriterForUnparsedAnnotations = new BufferedWriter(fileWriterForUnparsedAnnotations);

        int amountOfDataToFill = video_info_array.length();
        for (int i = 0; i < amountOfDataToFill; i++) {
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

            Iterator iterator = labelToSegments.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry pair = (Map.Entry) iterator.next();

                String neo4jRelationship = "";
                String neo4jObject = "";

                //BEGIN annotate and fill in DB
                Sentence sentence = new Sentence(pair.getKey().toString());
                List<String> posTags = sentence.posTags();
                List<String> lemmas = sentence.lemmas();
                for (int q = 0; q < posTags.size(); q++) {
                    if (neo4jRels.contains(posTags.get(q))) {
                        neo4jRelationship = lemmas.get(q);
                    } else if (neo4jObjs.contains(posTags.get(q))) {
                        neo4jObject = lemmas.get(q);
                    }
                }
                if (neo4jRelationship.length() > 1) {
                    String query = "";
                    if (neo4jRelationship.length() > 1 & neo4jObject.length() > 1) {
                        query = "merge(:PERSON)-[:" + neo4jRelationship + "{url:\"" + video_info_object.get("url") + "\"," + "segments:"
                                + labelToSegments.get(pair.getKey().toString()) + "}" + "]->(:OBJECT{name:\"" + neo4jObject + "\"})";
                        session.run(query);
                    } else if (neo4jRelationship.length() > 1 & neo4jObject.length() == 0) {
                        query = "merge()-[:" + neo4jRelationship + "{url:\"" + video_info_object.get("url") + "\","
                                + "segments:" + labelToSegments.get(pair.getKey().toString()) + "}" + "]->()";
                    }
                    session.run(query);
                    succeedLabelsOfAnnotations++;
                } else {
                    bufferedWriterForUnparsedAnnotations.write((totalNumberOfLabelsOfAnnotations - succeedLabelsOfAnnotations + 1)
                            + ". " + pair.getKey().toString() + "\n");
                }
                totalNumberOfLabelsOfAnnotations++;
                //END
            }
            System.out.println((i + 1) + " of " + amountOfDataToFill);
        }
        bufferedWriter.flush();
        bufferedWriter.close();

        bufferedWriterForUnparsedAnnotations.flush();
        bufferedWriterForUnparsedAnnotations.close();

        //BEGIN Neo4j driver&session close
        session.close();
        driver.close();
        //END

        System.out.println("########################################");
        System.out.println("Succeed number of labels: " + succeedLabelsOfAnnotations + " of " + totalNumberOfLabelsOfAnnotations);
        System.out.println("Failed number of labels: " + (totalNumberOfLabelsOfAnnotations - succeedLabelsOfAnnotations) + " of "
                + totalNumberOfLabelsOfAnnotations);
        System.out.println("########################################");

//        runCqlDump(PATH_TO_CQL_DUMP);
    }

    private static void runCqlDump(String dumpPath) {
        FillDB obj = new FillDB();
        String output = obj.executeCommand("neo4j-shell -file " + dumpPath);
        System.out.println(output);
    }

    private String executeCommand(String command) {
        StringBuilder output = new StringBuilder();
        Process p;
        try {
            p = Runtime.getRuntime().exec(command);
            p.waitFor();
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getErrorStream()));
            String line = "";
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return output.toString();
    }
}
