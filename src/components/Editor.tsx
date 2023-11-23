import React, { useRef, useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import jsonSchema from "../swml-schema.json";
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

export const Editor: React.FC = () => {
    const divEl = useRef<HTMLDivElement>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<"json" | "yaml">("json");
    const [code, setCode] = useState("{}");

    let editor: monaco.editor.IStandaloneCodeEditor;

    useEffect(() => {
        if (divEl.current) {
            configureMonacoYaml(monaco, {
                enableSchemaRequest: false,
                schemas: [
                    {
                        uri: "...",
                        // @ts-expect-error TypeScript can’t narrow down the type of JSON imports
                        jsonSchema,
                        fileMatch: ["*"],
                    },
                ],
                validate: true,
            });

            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: [
                    {
                        uri: "json",
                        fileMatch: ["*"],
                        schema: jsonSchema,
                    },
                ],
            });

            editor = monaco.editor.create(divEl.current, {
                value: code,
                language: selectedLanguage,
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
