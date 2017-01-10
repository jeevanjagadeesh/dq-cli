package com.informatica.qatrack;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;

public class ImportXML {

	public static void main(String[] args) throws Exception {
		if (args.length != 2) {
			System.out.println("Usage: java -classpath <classpath>  com.informatica.qatrack.ImportXML <url> <filename>]");
			System.out.println("    <url> - the Build Track URL to import the report to");
			System.out.println("    <filename> - XML file path");
			System.out.println();
			System.exit(1);
		}

		// Get target URL
		String strURL = args[0];
		// Get file to be posted
		String strXMLFilename = args[1];

		HttpClient httpclient = new DefaultHttpClient();

		HttpPost httppost = new HttpPost(strURL);
		FileBody buildReportXML = new FileBody(new File(strXMLFilename));
		StringBody module = new StringBody("ATBB");

		MultipartEntity reqEntity = new MultipartEntity();
		reqEntity.addPart("xml", buildReportXML);
		reqEntity.addPart("module", module);

		httppost.setEntity(reqEntity);

		System.out.println("executing request " + httppost.getRequestLine());
		HttpResponse response = httpclient.execute(httppost);
		HttpEntity resEntity = response.getEntity();

		 // If the response does not enclose an entity, there is no need
		 // to worry about connection release
		 if (resEntity != null) {
		     InputStream instream = resEntity.getContent();
		     try {

		         BufferedReader reader = new BufferedReader(
		                 new InputStreamReader(instream));
		         // do something useful with the response
		         System.out.println(reader.readLine());

		     } catch (IOException ex) {

		         // In case of an IOException the connection will be released
		         // back to the connection manager automatically
		         throw ex;

		     } catch (RuntimeException ex) {

		         // In case of an unexpected exception you may want to abort
		         // the HTTP request in order to shut down the underlying
		         // connection and release it back to the connection manager.
		    	 httppost.abort();
		         throw ex;

		     } finally {

		         // Closing the input stream will trigger connection release
		         instream.close();

		     }

		     // When HttpClient instance is no longer needed,
		     // shut down the connection manager to ensure
		     // immediate deallocation of all system resources
		     httpclient.getConnectionManager().shutdown();
		 }

		if (resEntity != null) {
			resEntity.consumeContent();
		}
	}
}