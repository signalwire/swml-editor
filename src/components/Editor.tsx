import React, { useRef, useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import { configureMonacoYaml } from "monaco-yaml";
import yamlLib from "yaml";

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: any, label: string) {
        if (label === "json") {
            return "./json.worker.bundle.js";
        }
        if (label === "yaml") {
            return "./yaml.worker.bundle.js";
        }
        return "./editor.worker.bundle.js";
    },
};

configureMonacoYaml(monaco, {
	enableSchemaRequest: true,
	validate: true,
	schemas: [
		{
			uri: "https://raw.githubusercontent.com/signalwire/swml-editor/main/src/swml-schema.json",
			fileMatch: ["*"],
		},
	],
});

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
	enableSchemaRequest: true,
	validate: true,
	schemas: [
		{
			uri: "https://raw.githubusercontent.com/signalwire/swml-editor/main/src/swml-schema.json",
			fileMatch: ["*"],
		},
	],
});

export const Editor: React.FC = () => {
    const divEl = useRef<HTMLDivElement>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<"json" | "yaml">(
        "json"
    );
    const [code, setCode] = useState(`{
	"sections": {
		"main": [

		]
	}
}`);

    let editor: monaco.editor.IStandaloneCodeEditor;

    useEffect(() => {
        if (divEl.current) {
            editor = monaco.editor.create(divEl.current, {
                value: code,
                language: selectedLanguage,
                tabSize: 2
            });
        }

        return () => {
            editor.dispose();
        };
    }, [selectedLanguage]);

    const handleLanguageChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        let previousCode = editor.getValue();
        let newCode = "";

        try {
            if (event.target.value == "yaml") {
                let parsedJson = JSON.parse(previousCode);
                newCode = yamlLib.stringify(parsedJson);
            } else {
                let parsedYaml = yamlLib.parse(previousCode);
                newCode = JSON.stringify(parsedYaml, null, 2);
            }
        } catch (error) {
            console.log(error);
            newCode = previousCode;
        }

        setSelectedLanguage(event.target.value as "json" | "yaml");
        setCode(newCode);
    };

    return (
        <div>
            <select value={selectedLanguage} onChange={handleLanguageChange}>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
            </select>
            <div className="Editor" ref={divEl}></div>
        </div>
    );
};
