package com.informatica.qatrack;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileFilter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.cli.PosixParser;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;

public final class ImportTestNG {

// ----------------
// Member variables
// ----------------

//  Variables for handling command line arguments
    private String[] args           = null;
    private CommandLine commandLine = null;
    private Options options         = null;

    private static final String BUILD_NUMBER_SHORT_OPTION              = "b";
    private static final String MODULE_NAME_SHORT_OPTION               = "m";
    private static final String VERSION_NAME_SHORT_OPTION              = "v";
    private static final String OPERATING_SYSTEM_SHORT_OPTION          = "o";
    private static final String DATABASE_TYPE_SHORT_OPTION             = "D";
    private static final String DATABASE_VERSION_SHORT_OPTION          = "V";
    private static final String DIRECTORY_SHORT_OPTION                 = "d";
    private static final String FILE_PATTERN_SHORT_OPTION              = "f";
    private static final String URL_SHORT_OPTION                       = "u";
    private static final String TYPE_SHORT_OPTION                            = "t";
    
    

     private static final int INVALID_OPTIONS            = 1;


    // Help Messages
     private static final String BUILD_NUMBER_HELP_MSG              = "Build Number";
     private static final String MODULE_NAME_HELP_MSG               = "Module Name";
     private static final String VERSION_NAME_HELP_MSG              = "Version Name";
     private static final String OPERATING_SYSTEM_HELP_MSG          = "Operating System";
     private static final String DATABASE_TYPE_HELP_MSG             = "Database Type <Optional>";
     private static final String DATABASE_VERSION_HELP_MSG          = "Database Version <Optional>";
     private static final String DIRECTORY_HELP_MSG                 = "Directory of the TestNG results file";
     private static final String FILE_PATTERN_HELP_MSG              = "TestNG results file pattern";
     private static final String URL_HELP_MSG                       = "QATrack Servlet URL";
     private static final String TYPE_HELP_MSG                      = "Type of Test Case <Optional>";

     private ImportTestNGConfig importTestNGCmdConfig               = new ImportTestNGConfig();
     
     InfaFileFilter fileNameFilter = new InfaFileFilter();
     List<File> testNGFiles = new ArrayList<File>();

//  -----------------------
//  Public member functions
//  -----------------------

    /**
     * @param paramArgs command line arguments
     */
    public ImportTestNG(String[] paramArgs) {
        this.args = new String[paramArgs.length];
        System.arraycopy(paramArgs, 0, this.args, 0, paramArgs.length);
    }

    /**
     * @param args TODO
     * @throws Exception TODO
     */
    public static void main(String[] args) throws Exception {
        ImportTestNG prsAgentInstance = new ImportTestNG(args);
        prsAgentInstance.execute();
    }

    /**
     * executes the commands issued in the command line invocation.
     */
    public void execute() {
        startApp(this.args);
    }

//  -----------------------
//  Internal implementation
//  -----------------------

    /**
     * @see com.informatica.componentfw.StandaloneAppStarter#startApp(java.lang.String[])
     */
    private void startApp(String[] paramArgs) {
        try {
            // parse command line options
            this.commandLine = getCommandLineWithOptions(paramArgs);

            // initialize configurations with command-line arguments
            populateMembers();
            validateCommandLine();

            // execute command line requests with initialized configurations
            executeCommands();
        } catch (ParseException pe) {
            // Help message already displayed
            System.exit(INVALID_OPTIONS);
        }
    }




    private void populateMembers() {
        if (this.commandLine.hasOption(BUILD_NUMBER_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(BUILD_NUMBER_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setBuildNumber(value);
        }

        if (this.commandLine.hasOption(MODULE_NAME_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(MODULE_NAME_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setModuleName(value);
        }

        if (this.commandLine.hasOption(VERSION_NAME_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(VERSION_NAME_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setVersionName(value);
        }

        if (this.commandLine.hasOption(OPERATING_SYSTEM_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(OPERATING_SYSTEM_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setOperatingSystem(value);
        }

        if (this.commandLine.hasOption(DATABASE_TYPE_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(DATABASE_TYPE_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setDatabaseType(value);
        }

        if (this.commandLine.hasOption(DATABASE_VERSION_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(DATABASE_VERSION_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setDatabaseVersion(value);
        }

        if (this.commandLine.hasOption(DIRECTORY_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(DIRECTORY_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setDirectory(value);
        }

        if (this.commandLine.hasOption(FILE_PATTERN_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(FILE_PATTERN_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setFilePattern(value);
        }

        if (this.commandLine.hasOption(URL_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(URL_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setUrl(value);
        }

        if (this.commandLine.hasOption(TYPE_SHORT_OPTION)) {
            String value = this.commandLine.getOptionValue(TYPE_SHORT_OPTION).trim();
            this.importTestNGCmdConfig.setType(value);
        }
    
    }

    private void validateCommandLine() {
    }

    /**
     *
     * @throws PRSAgentException
     */
    public void executeCommands() {
    	String testNGMergedFile = "TempImportTestNGMergedXMLFile" + System.currentTimeMillis() + ".xml"; 
    	try {
        	StringBuffer out= new StringBuffer();
    		File dir = new File(this.importTestNGCmdConfig.getDirectory());
    		if(dir.exists()) {
    			getTestNGFile(dir, out);    			
    		} else {
    			out.append("Directory doesn't exist -  " + this.importTestNGCmdConfig.getDirectory());
    			return;
    		}
    		
    		if(testNGFiles.size() > 0 ) {    			
    			
    			BufferedWriter outPut=new BufferedWriter(new FileWriter(testNGMergedFile, true));
    			outPut.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
				outPut.newLine();
				outPut.write("<qatrackreport>");
				outPut.newLine();
    			outPut.flush(); 
				outPut.close(); 
    			
    			
    			for(File testNGFile : testNGFiles) {
    				System.out.println("Including File - " + testNGFile);

    				String lines; 
    				String srcFile = testNGFile.getPath(); 

    				BufferedReader inFile=new BufferedReader(new FileReader(new File(srcFile))); 
    				outPut=new BufferedWriter(new FileWriter(testNGMergedFile, true));
    				while((lines=inFile.readLine()) != null) {    					
    					if(lines.contains("<?xml"))
    						continue;    					
    					outPut.write(lines);
    					outPut.newLine();
    				}
    				outPut.flush(); 
    				outPut.close(); 
    				inFile.close(); 
    			}
    			
    			outPut=new BufferedWriter(new FileWriter(testNGMergedFile, true));
 				outPut.write("</qatrackreport>");
 				outPut.newLine();
     			outPut.flush(); 
 				outPut.close(); 
    			
    			
    			//IMPORT Results in to QATrack
    			
    			// Get target URL
    			//String strURL = "http://caw175334:8080/qatrack/servlet/ImportTestNGXMLServlet";
 				
 				URL servletURL = new URL(this.importTestNGCmdConfig.getUrl());

    			HttpClient httpclient = new DefaultHttpClient();

    			HttpPost httppost = new HttpPost(this.importTestNGCmdConfig.getUrl());
    			FileBody buildReportXML = new FileBody(new File(testNGMergedFile));
    			

    			MultipartEntity reqEntity = new MultipartEntity();
    			reqEntity.addPart("xml", buildReportXML);   			
    			
    			reqEntity.addPart("buildnumber", new StringBody(this.importTestNGCmdConfig.getBuildNumber()));
    			reqEntity.addPart("module", new StringBody(this.importTestNGCmdConfig.getModuleName()));
    			reqEntity.addPart("version", new StringBody(this.importTestNGCmdConfig.getVersionName()));
    			reqEntity.addPart("os", new StringBody(this.importTestNGCmdConfig.getOperatingSystem()));
    			reqEntity.addPart("databasetype", new StringBody(this.importTestNGCmdConfig.getDatabaseType()));
    			reqEntity.addPart("databaseversion", new StringBody(this.importTestNGCmdConfig.getDatabaseVersion()));
    			reqEntity.addPart("type", new StringBody(this.importTestNGCmdConfig.getType()));
    			

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
    		
    		
    	} catch (Exception e) {
    		e.printStackTrace();
    	} finally {
    		File tempFile = new File(testNGMergedFile);
    		if(tempFile.exists()) {
    			tempFile.delete();
    		}
    	}
    }

     /**
     * @param paramArgs
     *            arguments
     * @return CommandLine command line
     * @throws ParseException
     *             cli exception
     */
    public CommandLine getCommandLineWithOptions(String[] paramArgs) throws ParseException {
        CommandLineParser parser = new PosixParser();

        this.options = new Options();

        Option buildNumberOption = new Option(
            BUILD_NUMBER_SHORT_OPTION,
            "buildNumber",
            true,
            BUILD_NUMBER_HELP_MSG
        );
        buildNumberOption.setRequired(true);
        buildNumberOption.setArgName("buildNumber");

        Option moduleNameOption = new Option(
            MODULE_NAME_SHORT_OPTION,
            "moduleName",
            true,
            MODULE_NAME_HELP_MSG
        );
        moduleNameOption.setRequired(true);
        moduleNameOption.setArgName("moduleName");

        Option versionNameOption = new Option(
            VERSION_NAME_SHORT_OPTION,
            "versionName",
            true,
            VERSION_NAME_HELP_MSG
        );
        versionNameOption.setRequired(true);
        versionNameOption.setArgName("versionName");

        Option operatingSystmeOption = new Option(
            OPERATING_SYSTEM_SHORT_OPTION,
            "operatingSystem",
            true,
            OPERATING_SYSTEM_HELP_MSG
        );
        operatingSystmeOption.setRequired(true);
        operatingSystmeOption.setArgName("operatingSystem");

        Option databaseTypeOption = new Option(
                DATABASE_TYPE_SHORT_OPTION,
                "databaseType",
                true,
                DATABASE_TYPE_HELP_MSG
            );
        databaseTypeOption.setRequired(false);
        databaseTypeOption.setArgName("databaseType");

        Option databaseVersionOption = new Option(
                DATABASE_VERSION_SHORT_OPTION,
                "databaseVersion",
                true,
                DATABASE_VERSION_HELP_MSG
            );
        databaseVersionOption.setRequired(false);
        databaseVersionOption.setArgName("databaseVersion");

        Option directoryOption = new Option(
                DIRECTORY_SHORT_OPTION,
                "directory",
                true,
                DIRECTORY_HELP_MSG
            );
        directoryOption.setRequired(true);
        directoryOption.setArgName("directory");

        Option filePatternOption = new Option(
                FILE_PATTERN_SHORT_OPTION,
                "filePattern",
                true,
                FILE_PATTERN_HELP_MSG
            );
        filePatternOption.setRequired(false);
        filePatternOption.setArgName("filePattern");

        
        Option urlOption = new Option(
                URL_SHORT_OPTION,
                "filePattern",
                true,
                URL_HELP_MSG
            );
        urlOption.setRequired(true);
        urlOption.setArgName("url");

        Option typeOption = new Option(
                TYPE_SHORT_OPTION,
                "type",
                true,
                TYPE_HELP_MSG
            );
        typeOption.setRequired(false);
        typeOption.setArgName("type");

        // Registering the various repository options
        options.addOption(buildNumberOption);
        options.addOption(moduleNameOption);
        options.addOption(versionNameOption);
        options.addOption(operatingSystmeOption);
        options.addOption(databaseTypeOption);
        options.addOption(databaseVersionOption);
        options.addOption(directoryOption);
        options.addOption(filePatternOption);
        options.addOption(urlOption);
        options.addOption(typeOption);

        CommandLine line = null;
        try {
            line = parser.parse(options, paramArgs);
        } catch (ParseException pe) {
        	pe.printStackTrace();
            printPRSAgentHelp();
            throw pe;
        }
        return line;
    }

    /**
     * Prints the repository agent help.
     */
    private void printPRSAgentHelp() {
        HelpFormatter formatter = new HelpFormatter();
        formatter.printHelp("importTestNG", options);
    }

    private String getOverridableSetting(String envKey, String configKey, String defaultValue) {
        String result = System.getenv(envKey);
        if (result == null || result.trim().length() == 0) {
            result = System.getProperty(configKey, defaultValue);
        }

        return result;
    }
    
	private void getTestNGFile(File nextLogFile, StringBuffer out) throws IOException {
		if (!nextLogFile.exists()) {
			out.append(nextLogFile.toString() + " does not exist. Skipping ...");
		} else if (nextLogFile.isDirectory()) {
			File[] children = nextLogFile.listFiles(new FileFilter() {
				public boolean accept(File file) {
					return file.isDirectory()
					|| fileNameFilter.accept(file);
				}
			});
			Arrays.sort(children);
			for (int j = 0; j < children.length; j++) {
				getTestNGFile(children[j], out);
			}
		} else if (nextLogFile.isFile()) {
			if (nextLogFile.length() == 0) {
				out.append(nextLogFile.toString() + " is empty. Skipping ...");
			} else {
				//if(nextLogFile.getCanonicalPath().contains("surefire-reports"))
					testNGFiles.add(nextLogFile);
			}
		} else {
			out.append(nextLogFile.toString() + " is not a directory or a file. Skipping ...");
		}
	}


	private class InfaFileFilter implements java.io.FileFilter {
		public boolean accept(File f) {
			if (f.isDirectory()) return true;
			String name = f.getName().toLowerCase();
			if(importTestNGCmdConfig.getFilePattern() != null)
				return name.startsWith(importTestNGCmdConfig.getFilePattern()) && name.endsWith("xml");
			else 
				return name.endsWith("xml");
		}
	}
}
