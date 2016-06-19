package json;

import java.io.*;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ParseJsonDataset {

    public static void main(String[] args) {

        String jsonString = readJSONtoString("/home/sherafgan/Downloads/activity_net.v1-3.min.json");

        try {
            JSONObject jsonObject = new JSONObject(jsonString);
//            System.out.println("\n\njsonArray: " + jsonObject);
            JSONObject databaseObject = jsonObject.getJSONObject("database");
            JSONArray annotationsArray = new JSONArray();
            Set<String> keysOfDbObject = databaseObject.keySet();
            for (String key : keysOfDbObject) {
                annotationsArray.put(databaseObject.get(key));
            }
            List<String> outputList = new LinkedList<>();
            for (int i = 0; i < annotationsArray.length(); i++) {
                JSONObject tmpObj = (JSONObject) annotationsArray.get(i);
                JSONArray annotations = (JSONArray) tmpObj.get("annotations");
                for (int j = 0; j < annotations.length(); j++) {
                    JSONObject tmp = (JSONObject) annotations.get(j);
                    outputList.add((i + 1) + "." + (j + 1) + " " + tmp.get("label") + " - " + tmp.get("segment"));
                }
            }
            outputList.add("Total amount of annotation: " + outputList.size());

            writeListToFile(outputList, "annotaions.txt");
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private static void writeListToFile(List<String> outputList, String fileName) {
        try {
            FileWriter fileWriter = new FileWriter(fileName);
            BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
            for (String annotation : outputList) {
                bufferedWriter.write(annotation + "\n");
            }
            bufferedWriter.flush();
            bufferedWriter.close();
        } catch (IOException ex) {
            System.out.println(
                    "Error writing to file '" + fileName + "'");
        }
    }

    private static String readJSONtoString(String fileName) {
        String line = null;
        try {
            FileReader fileReader = new FileReader(fileName);
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            line = bufferedReader.readLine();
//            System.out.println(line);
            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            System.out.println("Unable to open file!");
        } catch (IOException ex) {
            System.out.println("Error reading file!");
        }
        return line;
    }
}