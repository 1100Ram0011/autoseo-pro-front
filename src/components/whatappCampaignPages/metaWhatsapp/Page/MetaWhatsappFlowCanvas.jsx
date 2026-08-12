import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { 
    Zap, 
    Plus, 
    Minus,
    Edit2, 
    Trash2, 
    MessageSquare, 
    Layers, 
    X,
    Activity,
    Save,
    RefreshCw,
    Move,
    MousePointer,
    FileText,
    Globe,
    GitFork,
    Bot,
    Undo2,
    Redo2,
    Hand
} from "lucide-react";
import toast from "react-hot-toast";
import MetaInteractiveBuilder from "./MetaInteractiveBuilder";
import { useTestApiRequestMutation } from "../../../../../redux/apis/metaWhatsapp.api";

export default function MetaWhatsappFlowCanvas({
    flows = [],
    interactiveTemplates = [],
    metaTemplates = [],
    onEditRule,
    onDeleteRule,
    onToggleRule,
    onCreateRuleForPayload,
    createFlow,
    updateFlow,
    deleteFlow,
    numberId,
    flowId = null,
    currentFlow = null,
    updateFlowList = null,
    onCreateInteractiveTemplate,
    onEditInteractiveTemplate,
    onHasUnsavedChangesChange = null,
    onRegisterSaveHandler = null
}) {
    const canvasRef = useRef(null);

    // Unsaved changes tracking
    const [isDirty, setIsDirty] = useState(false);

    const markDirty = () => {
        if (!isDirty) {
            setIsDirty(true);
        }
        onHasUnsavedChangesChange?.(true);
    };

    const extractMetaVariablesFromTemplate = (template) => {
        if (!template) return [];
        let fullText = "";
        if (Array.isArray(template.components)) {
            template.components.forEach(comp => {
                if (comp.text) fullText += " " + comp.text;
            });
        } else {
            if (typeof template.body === "string") fullText += " " + template.body;
            if (typeof template.bodyText === "string") fullText += " " + template.bodyText;
            if (typeof template.headerText === "string") fullText += " " + template.headerText;
            if (typeof template.footerText === "string") fullText += " " + template.footerText;
            if (Array.isArray(template.buttons)) {
                template.buttons.forEach(btn => { if (btn.title) fullText += " " + btn.title; });
            }
            if (Array.isArray(template.sections)) {
                template.sections.forEach(sec => {
                    if (sec.title) fullText += " " + sec.title;
                    if (Array.isArray(sec.rows)) {
                        sec.rows.forEach(r => {
                            if (r.title) fullText += " " + r.title;
                            if (r.description) fullText += " " + r.description;
                        });
                    }
                });
            }
        }
        const matches = fullText.match(/\{\{(\d+|\w+)\}\}/g);
        if (!matches) return [];
        const uniqueKeys = Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, "").trim())));
        return uniqueKeys.sort((a, b) => {
            if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
            return a.localeCompare(b);
        });
    };

    const extractMetaButtonsFromTemplate = (template) => {
        if (!template) return [];
        const buttons = [];

        // 1. Meta Approved Template with components array
        if (Array.isArray(template.components)) {
            template.components.forEach(comp => {
                if ((comp.type === "BUTTONS" || comp.type === "buttons") && Array.isArray(comp.buttons)) {
                    comp.buttons.forEach((btn, idx) => {
                        const title = btn.text || btn.title || `Button ${idx + 1}`;
                        const id = (btn.id || btn.text || btn.title || `btn_${idx + 1}`).trim();
                        buttons.push({
                            id: id,
                            title: title,
                            type: btn.type || "QUICK_REPLY"
                        });
                    });
                }
            });
        }

        // 2. Custom Interactive Template or Direct buttons array
        if (buttons.length === 0 && Array.isArray(template.buttons)) {
            template.buttons.forEach((btn, idx) => {
                const title = btn.title || btn.text || `Button ${idx + 1}`;
                const id = (btn.id || btn.title || btn.text || `btn_${idx + 1}`).trim();
                buttons.push({
                    id: id,
                    title: title,
                    type: btn.type || "reply"
                });
            });
        }

        // 3. Custom List Template sections
        if (buttons.length === 0 && Array.isArray(template.sections)) {
            template.sections.forEach(sec => {
                if (Array.isArray(sec.rows)) {
                    sec.rows.forEach((row, rIdx) => {
                        const title = row.title || `Option ${rIdx + 1}`;
                        const id = (row.id || row.title || `row_${rIdx + 1}`).trim();
                        buttons.push({
                            id: id,
                            title: title,
                            type: "list_row",
                            description: row.description || ""
                        });
                    });
                }
            });
        }

        return buttons;
    };

    // Canvas panning & zooming
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1.0);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    // Visual Node representations
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [resolvedWires, setResolvedWires] = useState([]);

    // Interaction states
    const [draggedNodeId, setDraggedNodeId] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Live wiring connection state
    const [activePort, setActivePort] = useState(null); // { nodeId, portId, portType }
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    // Target port hover track
    const [hoveredPort, setHoveredPort] = useState(null); // { nodeId }

    // Re-draw triggers
    const [tick, setTick] = useState(0);

    // History state for Undo/Redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isInitialLoadRef = useRef(true);
    const prevFlowIdRef = useRef(flowId);

    const pushStateToHistory = (newNodes, newConnections) => {
        if (isInitialLoadRef.current) return;
        setHistory(prev => {
            const nextHistory = prev.slice(0, historyIndex + 1);
            const newState = {
                nodes: JSON.parse(JSON.stringify(newNodes)),
                connections: JSON.parse(JSON.stringify(newConnections))
            };
            if (nextHistory.length >= 50) {
                nextHistory.shift();
            }
            nextHistory.push(newState);
            setHistoryIndex(nextHistory.length - 1);
            return nextHistory;
        });
    };

    const undo = () => {
        if (historyIndex > 0) {
            const nextIndex = historyIndex - 1;
            const prevState = history[nextIndex];
            if (prevState) {
                setNodes(JSON.parse(JSON.stringify(prevState.nodes)));
                setConnections(JSON.parse(JSON.stringify(prevState.connections)));
                setHistoryIndex(nextIndex);
                setTick(t => t + 1);
                localStorage.setItem("mytekai_chatbot_flow_layout", JSON.stringify({ 
                    nodes: prevState.nodes, 
                    connections: prevState.connections 
                }));
                localStorage.setItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`, JSON.stringify({ 
                    nodes: prevState.nodes, 
                    connections: prevState.connections 
                }));
            }
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextState = history[nextIndex];
            if (nextState) {
                setNodes(JSON.parse(JSON.stringify(nextState.nodes)));
                setConnections(JSON.parse(JSON.stringify(nextState.connections)));
                setHistoryIndex(nextIndex);
                setTick(t => t + 1);
                localStorage.setItem("mytekai_chatbot_flow_layout", JSON.stringify({ 
                    nodes: nextState.nodes, 
                    connections: nextState.connections 
                }));
                localStorage.setItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`, JSON.stringify({ 
                    nodes: nextState.nodes, 
                    connections: nextState.connections 
                }));
            }
        }
    };

    // Initialize history once nodes/connections are first loaded
    useEffect(() => {
        if (flows.length > 0 && isInitialLoadRef.current) {
            const timer = setTimeout(() => {
                if (nodes.length > 0) {
                    setHistory([{
                        nodes: JSON.parse(JSON.stringify(nodes)),
                        connections: JSON.parse(JSON.stringify(connections))
                    }]);
                    setHistoryIndex(0);
                    isInitialLoadRef.current = false;
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [flows, nodes, connections]);

    // Global Key Bindings for Undo/Redo & Spacebar Pan (Figma & AiSensy style)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const target = e.target;
            const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable || target.tagName === "SELECT";
            if (isInput) return;

            if (e.code === "Space" && !e.repeat) {
                setIsSpacePressed(true);
                return;
            }

            const key = e.key.toLowerCase();
            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && key === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if (isCtrl && key === "y") {
                e.preventDefault();
                redo();
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === "Space") {
                setIsSpacePressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [history, historyIndex]);

    // Initialize nodes and connections from flows on mount/change
    // Initialize nodes and connections from flows on mount/change
    useEffect(() => {
        const flowIdChanged = prevFlowIdRef.current !== flowId;
        prevFlowIdRef.current = flowId;

        let savedLayout = null;
        if (!flowIdChanged && nodes.length > 0) {
            // Keep using the active/modified layout state
            savedLayout = { nodes, connections, offset, zoom };
        } else {
            // Flow changed or initial load: read from currentFlow?.layout first, then fallback to localStorage if missing or empty
            savedLayout = currentFlow?.layout;
            if (typeof savedLayout === "string") {
                try {
                    savedLayout = JSON.parse(savedLayout);
                } catch (e) {
                    console.error("Failed parsing DB flow layout string", e);
                }
            }

            if (!savedLayout || !Array.isArray(savedLayout.nodes) || savedLayout.nodes.length === 0) {
                const localLayout = localStorage.getItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`);
                try {
                    if (localLayout) savedLayout = JSON.parse(localLayout);
                } catch (e) {
                    console.error("Failed parsing flow layout from localStorage", e);
                }
            }

            if (savedLayout?.offset) {
                setOffset(savedLayout.offset);
            } else {
                setOffset({ x: 0, y: 0 });
            }
            if (savedLayout?.zoom) {
                setZoom(savedLayout.zoom);
            } else {
                setZoom(1.0);
            }
        }

        const tempNodes = [];
        const tempConnections = [];

        // Helper to get action node ID for a rule
        const getActionNodeId = (rule) => {
            if (rule.replyType === "interactive") {
                const tId = rule.replyInteractiveId?._id || rule.replyInteractiveId;
                return `template-${tId}`;
            }
            if (rule.replyType === "meta_template") {
                return `template-meta-${rule.templateName || rule._id}`;
            }
            if (rule.replyType === "api_request") {
                return `api-${rule._id}`;
            }
            
            // Check if saved layout or existing node matches text content
            if (rule.replyType === "text" && Array.isArray(savedLayout?.nodes)) {
                const existing = savedLayout.nodes.find(n => n.type === "text" && n.data?.text === rule.replyText);
                if (existing) return existing.id;
            }

            return `reply-${rule._id}`;
        };

        // 1. Process all rules in flows to create Action Nodes
        flows.forEach((rule, idx) => {
            const nodeId = getActionNodeId(rule);
            let savedNode = savedLayout?.nodes?.find(n => n.id === nodeId);
            
            // Fallback 1: Smart lookup if node ID shifted or mapped
            if (!savedNode && Array.isArray(savedLayout?.nodes)) {
                const targetInteractiveId = String(rule.replyInteractiveId?._id || rule.replyInteractiveId || "");
                savedNode = savedLayout.nodes.find(n => {
                    if (n.id === nodeId) return true;
                    if (rule._id && String(n.id).includes(String(rule._id))) return true;
                    if (rule.replyType === "interactive" && targetInteractiveId && (String(n.data?.templateId) === targetInteractiveId || String(n.id).includes(targetInteractiveId))) return true;
                    if (rule.replyType === "meta_template" && (n.data?.templateName === rule.templateName || String(n.data?.templateId) === `meta:${rule.templateName}`)) return true;
                    if (rule.replyType === "api_request" && (n.data?.apiUrl === rule.apiUrl || String(n.id).includes(String(rule._id)))) return true;
                    if (rule.replyType === "text" && n.data?.text === rule.replyText) return true;
                    return false;
                });
            }

            // Fallback 2: Match by saved container position at the same index
            if (!savedNode && Array.isArray(savedLayout?.nodes) && savedLayout.nodes[idx]) {
                const candidate = savedLayout.nodes[idx];
                if (candidate && candidate.x !== undefined && candidate.y !== undefined) {
                    savedNode = candidate;
                }
            }

            const effectiveNodeId = savedNode?.id || nodeId;

            // Avoid duplicate nodes if a node with this ID or identical content already exists in tempNodes
            if (tempNodes.some(n => n.id === effectiveNodeId || n.id === nodeId || (rule.replyType === "text" && n.type === "text" && n.data?.text === rule.replyText))) {
                return;
            }

            const data = {};
            if (rule.replyType === "text") {
                data.text = rule.replyText || "";
            } else if (rule.replyType === "interactive") {
                data.templateType = "interactive";
                data.templateId = rule.replyInteractiveId?._id || rule.replyInteractiveId;
                data.templateParams = rule.templateParams || {};
            } else if (rule.replyType === "meta_template") {
                data.templateType = "meta_template";
                data.templateName = rule.templateName || "";
                data.templateId = `meta:${rule.templateName || ""}`;
                data.templateLanguage = rule.templateLanguage || "en";
                data.templateParams = rule.templateParams || {};
            } else if (rule.replyType === "api_request") {
                data.apiUrl = rule.apiUrl || "";
                data.apiBody = rule.apiBody || "";
                data.apiMethod = rule.apiMethod || "POST";
                data.apiHeaders = rule.apiHeaders || [];
                data.apiParams = rule.apiParams || [];
                data.responseAttributes = rule.responseAttributes || [];
                // Find all responses
                const responses = flows.filter(f => f.triggerType === "api_response" && f.triggerValue.startsWith(`${rule._id}-`));
                const codes = responses.map(r => r.triggerValue.replace(`${rule._id}-`, ""));
                data.statusCodes = codes.length > 0 ? codes : ["200", "400", "fallback"];
            } else if (rule.replyType === "set_attribute") {
                data.attributeName = rule.attributeName || "";
                data.attributeValue = rule.attributeValue || "";
            } else if (rule.replyType === "add_tag") {
                data.tagName = rule.tagName || "";
            } else if (rule.replyType === "intervention") {
                // intervention has no special config fields
            } else if (rule.replyType === "condition") {
                data.conditionAttribute = rule.conditionAttribute || "";
                data.conditionOperator = rule.conditionOperator || "equals";
                data.conditionValue = rule.conditionValue || "";
            }

            // Calculate intelligent adjacent fallback position if a node has no saved position
            let fallbackX = 350;
            let fallbackY = 120;
            if (tempNodes.length > 0) {
                const prev = tempNodes[tempNodes.length - 1];
                fallbackX = prev.x + 320;
                fallbackY = prev.y;
            }

            tempNodes.push({
                id: effectiveNodeId,
                type: rule.replyType === "api_request" ? "api" : (rule.replyType === "meta_template" ? "interactive" : rule.replyType),
                x: savedNode?.x ?? fallbackX,
                y: savedNode?.y ?? fallbackY,
                data: { ...(savedNode?.data || {}), ...data }
            });
        });

        // 2. Process triggers and build connections
        flows.forEach((rule, idx) => {
            const targetNodeId = getActionNodeId(rule);

            if (rule.triggerType === "keyword") {
                const kwNodeId = `keyword-${rule._id}`;
                let savedKw = savedLayout?.nodes?.find(n => n.id === kwNodeId);
                if (!savedKw && Array.isArray(savedLayout?.nodes)) {
                    savedKw = savedLayout.nodes.find(n => n.type === "keyword" && n.data?.triggerValue === rule.triggerValue);
                }
                if (!savedKw && Array.isArray(savedLayout?.nodes)) {
                    savedKw = savedLayout.nodes.find(n => n.type === "keyword");
                }
                
                // Add Keyword Trigger Node
                tempNodes.push({
                    id: kwNodeId,
                    type: "keyword",
                    x: savedKw?.x ?? 80,
                    y: savedKw?.y ?? (120 + idx * 180),
                    data: { triggerValue: rule.triggerValue }
                });

                // Add connection to target Action node
                tempConnections.push({
                    id: `conn-kw-${rule._id}`,
                    fromNodeId: kwNodeId,
                    fromPortId: "out",
                    toNodeId: targetNodeId
                });
            } else if (rule.triggerType === "next_step") {
                const parentRuleId = rule.triggerValue;
                const parentRule = flows.find(f => f._id === parentRuleId);
                if (parentRule) {
                    const parentNodeId = getActionNodeId(parentRule);
                    tempConnections.push({
                        id: `conn-next-${rule._id}`,
                        fromNodeId: parentNodeId,
                        fromPortId: "next",
                        toNodeId: targetNodeId
                    });
                }
            } else if (rule.triggerType === "condition_branch") {
                // format: <parentRuleId>-true or <parentRuleId>-false
                const parts = rule.triggerValue.split("-");
                if (parts.length >= 2) {
                    const parentRuleId = parts[0];
                    const branch = parts.slice(1).join("-");
                    const parentRule = flows.find(f => f._id === parentRuleId);
                    if (parentRule) {
                        const parentNodeId = getActionNodeId(parentRule);
                        tempConnections.push({
                            id: `conn-cond-${rule._id}`,
                            fromNodeId: parentNodeId,
                            fromPortId: branch,
                            toNodeId: targetNodeId
                        });
                    }
                }
            } else if (rule.triggerType === "api_response") {
                // format: <parentRuleId>-<statusCode>
                const parts = rule.triggerValue.split("-");
                if (parts.length >= 2) {
                    const parentRuleId = parts[0];
                    const code = parts.slice(1).join("-");
                    const parentRule = flows.find(f => f._id === parentRuleId);
                    if (parentRule) {
                        const parentNodeId = getActionNodeId(parentRule);
                        tempConnections.push({
                            id: `conn-api-${rule._id}`,
                            fromNodeId: parentNodeId,
                            fromPortId: code,
                            toNodeId: targetNodeId
                        });
                    }
                }
            } else if (rule.triggerType === "button_payload") {
                // Find parent interactive template node using payload ID (Custom OR Meta Approved)
                const matchedTemplate = interactiveTemplates.find(t => {
                    const hasBtn = t.buttons?.some(b => b.id === rule.triggerValue || b.title === rule.triggerValue);
                    const hasRow = t.sections?.some(s => s.rows?.some(r => r.id === rule.triggerValue || r.title === rule.triggerValue));
                    return hasBtn || hasRow;
                });
                
                let parentNodeId = null;
                if (matchedTemplate) {
                    parentNodeId = `template-${matchedTemplate._id}`;
                } else {
                    const matchedMeta = metaTemplates.find(t => {
                        const btns = extractMetaButtonsFromTemplate(t);
                        return btns.some(b => b.id === rule.triggerValue || b.title === rule.triggerValue);
                    });
                    if (matchedMeta) {
                        parentNodeId = `template-meta-${matchedMeta.name}`;
                    }
                }

                if (parentNodeId) {
                    tempConnections.push({
                        id: `conn-btn-${rule._id}`,
                        fromNodeId: parentNodeId,
                        fromPortId: rule.triggerValue,
                        toNodeId: targetNodeId
                    });
                }
            }
        });

        // 3. Retain any orphaned spawned nodes from saved layout so user doesn't lose work
        savedLayout?.nodes?.forEach(savedNode => {
            if (savedNode.id.startsWith("spawned-")) {
                if (!tempNodes.find(n => n.id === savedNode.id)) {
                    tempNodes.push(savedNode);
                }
            }
        });

        // 4. Merge all wire connections from savedLayout to ensure 100% wire parity across browsers
        if (Array.isArray(savedLayout?.connections)) {
            savedLayout.connections.forEach(savedConn => {
                const fromExists = tempNodes.some(n => n.id === savedConn.fromNodeId);
                const toExists = tempNodes.some(n => n.id === savedConn.toNodeId);
                if (fromExists && toExists) {
                    if (!tempConnections.some(c => c.fromNodeId === savedConn.fromNodeId && c.fromPortId === savedConn.fromPortId && c.toNodeId === savedConn.toNodeId)) {
                        tempConnections.push(savedConn);
                    }
                }
            });
        }

        const hasValidSavedPositions = savedLayout?.nodes && savedLayout.nodes.length > 0;
        if (hasValidSavedPositions) {
            // 1. Directly use exact saved container nodes & wires from MongoDB / localStorage
            const finalNodes = savedLayout.nodes.map(n => ({
                ...n,
                data: n.data || {}
            }));
            const finalConnections = Array.isArray(savedLayout.connections) ? [...savedLayout.connections] : [];

            // 2. Ensure any newly added rules from external backend are also appended gracefully
            flows.forEach((rule) => {
                const ruleNodeId = getActionNodeId(rule);
                const exists = finalNodes.some(n => 
                    n.id === ruleNodeId || 
                    (rule._id && String(n.id).includes(String(rule._id)))
                );
                if (!exists) {
                    const prevNode = finalNodes[finalNodes.length - 1];
                    const newX = prevNode ? prevNode.x + 320 : 350;
                    const newY = prevNode ? prevNode.y : 120;
                    
                    const data = {};
                    if (rule.replyType === "text") data.text = rule.replyText || "";
                    if (rule.replyType === "api_request") {
                        data.apiUrl = rule.apiUrl || "";
                        data.apiBody = rule.apiBody || "";
                        data.apiMethod = rule.apiMethod || "POST";
                    }

                    finalNodes.push({
                        id: ruleNodeId,
                        type: rule.replyType === "api_request" ? "api" : (rule.replyType === "meta_template" ? "interactive" : rule.replyType),
                        x: newX,
                        y: newY,
                        data
                    });
                }
            });

            setNodes(finalNodes);
            setConnections(finalConnections);
        } else {
            // INITIAL UN-SAVED FLOW LOAD: Organize graph layout automatically
            setNodes(organizeGraphLayout(tempNodes, tempConnections));
            setConnections(tempConnections);
        }
        setIsDirty(false);
        onHasUnsavedChangesChange?.(false);
        setTimeout(() => {
            isInitialLoadRef.current = false;
        }, 150);
        setTick(t => t + 1);
    }, [flows, interactiveTemplates, currentFlow, flowId]);

    // Measure wire connections after paint layouts and transforms update
    useLayoutEffect(() => {
        if (!canvasRef.current) return;
        const containerEl = document.getElementById("visual-transform-container");
        if (!containerEl) return;
        const containerRect = containerEl.getBoundingClientRect();
        const paths = [];

        connections.forEach((conn) => {
            const fromEl = document.getElementById(`port-${conn.fromNodeId}-${conn.fromPortId}`);
            const toEl = document.getElementById(`input-port-${conn.toNodeId}`);

            if (fromEl && toEl) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                const x1 = (fromRect.right - containerRect.left) / zoom;
                const y1 = (fromRect.top + fromRect.height / 2 - containerRect.top) / zoom;

                const x2 = (toRect.left - containerRect.left) / zoom;
                const y2 = (toRect.top + toRect.height / 2 - containerRect.top) / zoom;

                const dx = Math.abs(x2 - x1) * 0.45;
                paths.push({
                    id: conn.id,
                    path: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
                    midX: (x1 + x2) / 2,
                    midY: (y1 + y2) / 2
                });
            }
        });

        setResolvedWires(paths);
    }, [nodes, connections, zoom, offset, tick]);

    // Handle mouse wheel zoom centering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onWheel = (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setZoom((prevZoom) => {
                const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
                const nextZoom = Math.max(0.05, Math.min(2.5, prevZoom * zoomFactor));
                
                setOffset((prevOffset) => {
                    const dx = mouseX - prevOffset.x;
                    const dy = mouseY - prevOffset.y;
                    return {
                        x: mouseX - dx * (nextZoom / prevZoom),
                        y: mouseY - dy * (nextZoom / prevZoom)
                    };
                });
                
                return nextZoom;
            });
            setTick(t => t + 1);
        };

        canvas.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            canvas.removeEventListener("wheel", onWheel);
        };
    }, []);

    // Handle background & viewport panning (Figma & AiSensy default behavior)
    const handleMouseDown = (e) => {
        const isMiddleOrRight = e.button === 1 || e.button === 2;
        const isInteractiveTarget = e.target.closest(
            "input, textarea, select, button, [id^='port-'], [id^='input-port-'], a"
        );
        const isNodeDragHandle = e.target.closest(".node-drag-handle");
        const isNodeCard = e.target.closest(".flow-node-card");

        // Natural Hand Tool viewport panning by default on canvas background, grid, SVG, middle/right click or spacebar
        if (isMiddleOrRight || isSpacePressed || (!isInteractiveTarget && !isNodeDragHandle && !isNodeCard)) {
            e.preventDefault();
            setIsPanning(true);
            setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            setOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });
            setTick(t => t + 1);
        } else if (draggedNodeId && !isSpacePressed) {
            const dx = (e.clientX - dragStart.x) / zoom;
            const dy = (e.clientY - dragStart.y) / zoom;
            setNodes(prev => prev.map(n => {
                if (n.id === draggedNodeId) {
                    return { ...n, x: n.x + dx, y: n.y + dy };
                }
                return n;
            }));
            setDragStart({ x: e.clientX, y: e.clientY });
            setTick(t => t + 1);
        }

        if (activePort) {
            const containerEl = document.getElementById("visual-transform-container");
            if (containerEl) {
                const containerRect = containerEl.getBoundingClientRect();
                setMousePos({
                    x: (e.clientX - containerRect.left) / zoom,
                    y: (e.clientY - containerRect.top) / zoom
                });
                setTick(t => t + 1);
            }
        }
    };

    const handleMouseUp = () => {
        if (isPanning) setIsPanning(false);
        if (draggedNodeId) {
            markDirty();
            setDraggedNodeId(null);
            saveLayoutToLocal();
            pushStateToHistory(nodes, connections);
            setTick(t => t + 1);
        }
        if (activePort) {
            // Check if mouse was released over a hovered target port node
            if (hoveredPort && hoveredPort !== activePort.nodeId) {
                markDirty();
                // Add connection
                const newConnection = {
                    id: `conn-${Date.now()}`,
                    fromNodeId: activePort.nodeId,
                    fromPortId: activePort.portId,
                    toNodeId: hoveredPort
                };

                // Remove duplicate connections from the same port
                setConnections(prev => {
                    const filtered = prev.filter(c => !(c.fromNodeId === activePort.nodeId && c.fromPortId === activePort.portId));
                    const next = [...filtered, newConnection];
                    pushStateToHistory(nodes, next);
                    return next;
                });
            }
            setActivePort(null);
            setHoveredPort(null);
        }
    };

    // Inline Template builder states & handlers
    const [isOpenInteractiveModal, setIsOpenInteractiveModal] = useState(false);
    const [targetNodeIdForNewTemplate, setTargetNodeIdForNewTemplate] = useState(null);
    const [initialEditingTemplateId, setInitialEditingTemplateId] = useState(null);

    const handleOpenCreateTemplate = (nodeId) => {
        setTargetNodeIdForNewTemplate(nodeId);
        setInitialEditingTemplateId(null);
        setIsOpenInteractiveModal(true);
    };

    const handleOpenEditTemplate = (nodeId, templateId) => {
        setTargetNodeIdForNewTemplate(nodeId);
        setInitialEditingTemplateId(templateId);
        setIsOpenInteractiveModal(true);
    };

    const handleSaveTemplateSuccess = (newTemplate) => {
        setIsOpenInteractiveModal(false);
        const newTemplateId = newTemplate?._id || newTemplate?.data?._id || newTemplate;
        if (newTemplateId && targetNodeIdForNewTemplate) {
            updateNodeData(targetNodeIdForNewTemplate, "templateId", newTemplateId);
        }
        setTargetNodeIdForNewTemplate(null);
        setInitialEditingTemplateId(null);
    };

    // API Request Modal states & handlers
    const [testApiRequestMutation] = useTestApiRequestMutation();
    const [isOpenApiModal, setIsOpenApiModal] = useState(false);
    const [editingApiNodeId, setEditingApiNodeId] = useState(null);
    const [apiModalData, setApiModalData] = useState({
        apiMethod: "POST",
        apiUrl: "",
        activeTab: "params",
        params: [{ key: "", value: "" }],
        headers: [{ key: "", value: "" }],
        body: "{\n  \"mobile\": \"$MobileNumber\"\n}",
        responseAttributes: [{ attribute: "", responseKey: "" }],
        testStatus: null,
        testResponse: null,
        isTesting: false
    });

    const handleOpenApiModal = (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        const nodeData = node.data || {};

        setEditingApiNodeId(nodeId);

        let defaultParams = Array.isArray(nodeData.apiParams) && nodeData.apiParams.length > 0
            ? nodeData.apiParams.map(p => ({ ...p }))
            : [{ key: "", value: "" }];

        let defaultHeaders = Array.isArray(nodeData.apiHeaders) && nodeData.apiHeaders.length > 0
            ? nodeData.apiHeaders.map(h => ({ ...h }))
            : [{ key: "", value: "" }];

        let defaultAttrs = Array.isArray(nodeData.responseAttributes) && nodeData.responseAttributes.length > 0
            ? nodeData.responseAttributes.map(a => ({ ...a }))
            : [{ attribute: "", responseKey: "" }];

        setApiModalData({
            apiMethod: nodeData.apiMethod || "POST",
            apiUrl: nodeData.apiUrl || "",
            activeTab: "params",
            params: defaultParams,
            headers: defaultHeaders,
            body: nodeData.apiBody || "{\n  \"mobile\": \"$MobileNumber\"\n}",
            responseAttributes: defaultAttrs,
            testStatus: null,
            testResponse: null,
            isTesting: false
        });

        setIsOpenApiModal(true);
    };

    const handleSaveApiModal = () => {
        if (!editingApiNodeId) return;
        markDirty();

        const cleanParams = apiModalData.params.filter(p => p.key.trim() || p.value.trim());
        const cleanHeaders = apiModalData.headers.filter(h => h.key.trim() || h.value.trim());
        const cleanAttrs = apiModalData.responseAttributes.filter(a => a.attribute.trim() || a.responseKey.trim());

        const updatedNodes = nodes.map(n => {
            if (n.id === editingApiNodeId) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        apiUrl: apiModalData.apiUrl.trim(),
                        apiMethod: apiModalData.apiMethod,
                        apiBody: apiModalData.body,
                        apiParams: cleanParams,
                        apiHeaders: cleanHeaders,
                        responseAttributes: cleanAttrs
                    }
                };
            }
            return n;
        });

        setNodes(updatedNodes);
        pushStateToHistory(updatedNodes, connections);

        localStorage.setItem("mytekai_chatbot_flow_layout", JSON.stringify({ nodes: updatedNodes, connections }));
        localStorage.setItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`, JSON.stringify({ nodes: updatedNodes, connections }));

        setIsOpenApiModal(false);
        setEditingApiNodeId(null);
        toast.success("API Request configuration saved");
    };

    const handleTestApi = async () => {
        if (!apiModalData.apiUrl.trim()) {
            toast.error("Please enter an API URL first.");
            return;
        }

        setApiModalData(prev => ({ ...prev, isTesting: true, testStatus: null, testResponse: null }));

        try {
            const proxyRes = await testApiRequestMutation({
                phoneNumberId: numberId || "default",
                url: apiModalData.apiUrl.trim(),
                method: apiModalData.apiMethod,
                headers: apiModalData.headers,
                params: apiModalData.params,
                body: apiModalData.body
            }).unwrap();

            if (proxyRes && proxyRes.status !== undefined) {
                setApiModalData(prev => ({
                    ...prev,
                    isTesting: false,
                    testStatus: proxyRes.status,
                    testResponse: proxyRes.data
                }));
                if (String(proxyRes.status).startsWith("2")) {
                    toast.success(`API Test Succeeded: Status ${proxyRes.status}`);
                } else {
                    toast.error(`API Test returned status ${proxyRes.status}`);
                }
                return;
            }
        } catch (proxyErr) {
            console.warn("Backend proxy API test error:", proxyErr);
            const status = proxyErr?.status || proxyErr?.data?.status || "Error";
            const respData = proxyErr?.data?.data || proxyErr?.data || { error: proxyErr?.data?.message || proxyErr?.message || "Network Error" };
            setApiModalData(prev => ({
                ...prev,
                isTesting: false,
                testStatus: status,
                testResponse: respData
            }));
            toast.error(`API Test returned status ${status}`);
        }
    };

    // Save positions layout to local storage
    const saveLayoutToLocal = () => {
        localStorage.setItem("mytekai_chatbot_flow_layout", JSON.stringify({ nodes, connections }));
        localStorage.setItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`, JSON.stringify({ nodes, connections }));
    };

    // Trigger node dragging
    const handleNodeDragStart = (e, nodeId) => {
        e.stopPropagation();
        setDraggedNodeId(nodeId);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    // Port wire connection drag initiation
    const handlePortMouseDown = (e, nodeId, portId) => {
        e.stopPropagation();
        const containerEl = document.getElementById("visual-transform-container");
        if (containerEl) {
            const containerRect = containerEl.getBoundingClientRect();
            setActivePort({ nodeId, portId });
            setMousePos({
                x: (e.clientX - containerRect.left) / zoom,
                y: (e.clientY - containerRect.top) / zoom
            });
        }
    };

    // Spawning new nodes from sidebar drag/drop
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("nodeType");
        if (!type) return;

        markDirty();
        const containerEl = document.getElementById("visual-transform-container");
        if (!containerEl) return;
        const containerRect = containerEl.getBoundingClientRect();
        const x = (e.clientX - containerRect.left) / zoom - 100;
        const y = (e.clientY - containerRect.top) / zoom - 40;

        const newNode = {
            id: `spawned-${type}-${Date.now()}`,
            type: type,
            x,
            y,
            data: type === "keyword" 
                ? { triggerValue: "new_keyword" } 
                : type === "text" 
                    ? { text: "Reply message here..." }
                    : type === "interactive"
                        ? { templateId: "" }
                        : type === "api"
                            ? { 
                                apiUrl: "", 
                                apiMethod: "POST", 
                                apiBody: "{\n  \"mobile\": \"$MobileNumber\"\n}", 
                                apiHeaders: [{ key: "", value: "" }], 
                                apiParams: [{ key: "", value: "" }], 
                                responseAttributes: [{ attribute: "", responseKey: "" }], 
                                statusCodes: ["200", "400", "fallback"] 
                              }
                            : type === "condition"
                                ? { conditionAttribute: "", conditionOperator: "equals", conditionValue: "" }
                                : type === "set_attribute"
                                    ? { attributeName: "", attributeValue: "" }
                                    : type === "add_tag"
                                        ? { tagName: "" }
                                        : {}
        };

        setNodes(prev => {
            const next = [...prev, newNode];
            pushStateToHistory(next, connections);
            return next;
        });
        saveLayoutToLocal();
    };

    // Inline inputs updating handler
    const updateNodeData = (nodeId, key, value, pushHistory = false) => {
        markDirty();
        setNodes(prev => {
            const next = prev.map(n => {
                if (n.id === nodeId) {
                    return { ...n, data: { ...n.data, [key]: value } };
                }
                return n;
            });
            if (pushHistory) {
                pushStateToHistory(next, connections);
            }
            return next;
        });
    };

    const addStatusCode = (nodeId) => {
        markDirty();
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                const currentCodes = n.data.statusCodes || ["200", "400", "fallback"];
                const fallbackIdx = currentCodes.indexOf("fallback");
                const nextCodes = [...currentCodes];
                if (fallbackIdx !== -1) {
                    nextCodes.splice(fallbackIdx, 0, "201");
                } else {
                    nextCodes.push("201", "fallback");
                }
                return { ...n, data: { ...n.data, statusCodes: nextCodes } };
            }
            return n;
        }));
    };

    const removeStatusCode = (nodeId, codeToRemove) => {
        if (codeToRemove === "fallback") return; // cannot delete fallback
        markDirty();
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                const currentCodes = n.data.statusCodes || ["200", "400", "fallback"];
                const nextCodes = currentCodes.filter(c => c !== codeToRemove);
                return { ...n, data: { ...n.data, statusCodes: nextCodes } };
            }
            return n;
        }));
        setConnections(prev => prev.filter(c => !(c.fromNodeId === nodeId && c.fromPortId === codeToRemove)));
    };

    const updateStatusCode = (nodeId, index, newValue) => {
        markDirty();
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                const currentCodes = [...(n.data.statusCodes || ["200", "400", "fallback"])];
                const oldValue = currentCodes[index];
                currentCodes[index] = newValue;
                
                // Update connections to map to the new port ID
                setConnections(prevConn => prevConn.map(c => {
                    if (c.fromNodeId === nodeId && c.fromPortId === oldValue) {
                        return { ...c, fromPortId: newValue };
                    }
                    return c;
                }));

                return { ...n, data: { ...n.data, statusCodes: currentCodes } };
            }
            return n;
        }));
    };

    // Delete node
    const handleDeleteNode = (nodeId) => {
        markDirty();
        const parts = nodeId.split("-");
        const prefix = parts[0];
        const dbId = parts[1];
        
        let spawnedActionId = null;
        let actionNodeId = null;

        if (dbId && dbId.length === 24) {
            if (prefix === "reply" || prefix === "api" || prefix === "keyword") {
                if (prefix === "keyword") {
                    const rule = flows.find(f => f._id === dbId);
                    if (rule) {
                        const ruleInteractiveId = rule.replyInteractiveId?._id || rule.replyInteractiveId;
                        actionNodeId = rule.replyType === "interactive" 
                            ? `template-${ruleInteractiveId}`
                            : (rule.replyType === "api_request" ? `api-${rule._id}` : `reply-${rule._id}`);
                        
                        if (actionNodeId.startsWith("reply-") || actionNodeId.startsWith("api-")) {
                            const actionPrefix = actionNodeId.split("-")[0];
                            spawnedActionId = `spawned-${actionPrefix === "api" ? "api" : rule.replyType}-${dbId}`;
                        }
                    }
                }
                onDeleteRule(dbId);
            }
        }

        setNodes(prev => {
            let updatedNodes = prev;
            if (actionNodeId && spawnedActionId) {
                updatedNodes = prev.map(n => {
                    if (n.id === actionNodeId) {
                        return { ...n, id: spawnedActionId };
                    }
                    return n;
                });
            }
            const nextNodes = updatedNodes.filter(n => n.id !== nodeId);

            setConnections(prevConn => {
                let updatedConns = prevConn;
                if (actionNodeId && spawnedActionId) {
                    updatedConns = prevConn.map(c => {
                        let updated = { ...c };
                        if (c.fromNodeId === actionNodeId) {
                            updated.fromNodeId = spawnedActionId;
                            updated.id = `conn-${spawnedActionId}-${c.toNodeId}-${c.fromPortId}`;
                        }
                        if (c.toNodeId === actionNodeId) {
                            updated.toNodeId = spawnedActionId;
                            updated.id = `conn-${c.fromNodeId}-${spawnedActionId}-${c.fromPortId}`;
                        }
                        return updated;
                    });
                }
                const nextConns = updatedConns.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
                pushStateToHistory(nextNodes, nextConns);
                
                // Save layout update to local storage
                localStorage.setItem("mytekai_chatbot_flow_layout", JSON.stringify({ nodes: nextNodes, connections: nextConns }));
                localStorage.setItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`, JSON.stringify({ nodes: nextNodes, connections: nextConns }));
                
                return nextConns;
            });

            return nextNodes;
        });
    };

    // Disconnect wire connection
    const handleDisconnectWire = (connId) => {
        markDirty();
        setConnections(prev => {
            const next = prev.filter(c => c.id !== connId);
            pushStateToHistory(nodes, next);
            return next;
        });
        saveLayoutToLocal();
    };

    // Topological / Hierarchical Level Auto-Layout Algorithm (Left-to-Right)
    const organizeGraphLayout = (currentNodes, currentConnections) => {
        if (!currentNodes || currentNodes.length === 0) return currentNodes;

        const nodeDepths = {};
        const incomingCount = {};
        
        currentNodes.forEach(n => {
            incomingCount[n.id] = 0;
            nodeDepths[n.id] = 0;
        });

        currentConnections.forEach(conn => {
            if (incomingCount[conn.toNodeId] !== undefined) {
                incomingCount[conn.toNodeId] += 1;
            }
        });

        // Level 0: Keyword triggers or root nodes (nodes with 0 incoming connections)
        const roots = currentNodes.filter(n => n.type === "keyword" || incomingCount[n.id] === 0);
        roots.forEach(n => {
            nodeDepths[n.id] = 0;
        });

        // BFS traversal to compute column levels
        const visited = new Set();
        const queue = [...roots];

        while (queue.length > 0) {
            const curr = queue.shift();
            if (visited.has(curr.id)) continue;
            visited.add(curr.id);

            const currDepth = nodeDepths[curr.id] || 0;
            const outgoing = currentConnections.filter(c => c.fromNodeId === curr.id);

            outgoing.forEach(conn => {
                const target = currentNodes.find(n => n.id === conn.toNodeId);
                if (target) {
                    nodeDepths[target.id] = Math.max(nodeDepths[target.id] || 0, currDepth + 1);
                    queue.push(target);
                }
            });
        }

        // Assign unvisited nodes to level 1
        currentNodes.forEach(n => {
            if (!visited.has(n.id) && n.type !== "keyword") {
                nodeDepths[n.id] = 1;
            }
        });

        // Group nodes by depth level
        const levels = {};
        currentNodes.forEach(n => {
            const d = nodeDepths[n.id] || 0;
            if (!levels[d]) levels[d] = [];
            levels[d].push(n);
        });

        // Assign clean X and Y coordinates per level
        const COL_WIDTH = 420;
        const ROW_HEIGHT = 260;
        const START_X = 80;
        const START_Y = 80;

        const arrangedNodes = [];

        Object.keys(levels).sort((a, b) => Number(a) - Number(b)).forEach(levelKey => {
            const level = Number(levelKey);
            const levelNodes = levels[level];
            const x = START_X + level * COL_WIDTH;

            levelNodes.forEach((node, idx) => {
                arrangedNodes.push({
                    ...node,
                    x,
                    y: START_Y + idx * ROW_HEIGHT
                });
            });
        });

        return arrangedNodes;
    };

    // Reset layout configuration to clean structured Left-to-Right flowchart
    const handleResetLayout = () => {
        localStorage.removeItem("mytekai_chatbot_flow_layout");
        localStorage.removeItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`);
        
        const cleanedNodes = organizeGraphLayout(nodes, connections);
        setNodes(cleanedNodes);
        setOffset({ x: 20, y: 20 });
        setZoom(0.85);
        toast.success("Canvas layout organized into a clean flow graph!");
    };

    // Save/Commit the whole flow graph back to backend Rules database
    const handleSaveRules = async () => {
        if (!numberId) {
            toast.error("Please select a WhatsApp number first.");
            return;
        }

        const toastId = toast.loading("Saving chatbot flow...");

        try {
            const nodeToRuleIdMap = {};
            const savedRuleIds = {}; // Maps canvas nodeId to database _id of its rule
            const activeRulesList = [];

            // Recursive function to save rules downstream
            const saveNode = async (node, triggerType, triggerValue) => {
                if (!node) return null;
                const nodeData = node.data || {};

                if (node.type === "keyword") {
                    const conn = connections.find(c => c.fromNodeId === node.id && c.fromPortId === "out");
                    if (conn) {
                        const targetNode = nodes.find(n => n.id === conn.toNodeId);
                        if (targetNode) {
                            const savedRule = await saveNode(targetNode, "keyword", (nodeData.triggerValue || "").trim());
                            if (savedRule) {
                                const savedRuleId = savedRule.data?._id || savedRule._id;
                                nodeToRuleIdMap[node.id] = `keyword-${savedRuleId}`;
                            }
                        }
                    }
                    return null;
                }

                const isMetaNode = node.type === "interactive" && (
                    nodeData.templateType === "meta_template" || 
                    (nodeData.templateId && String(nodeData.templateId).startsWith("meta:")) ||
                    metaTemplates.some(t => t.name === nodeData.templateName || `meta:${t.name}` === nodeData.templateId)
                );

                // Construct rule payload
                const rule = {
                    triggerType,
                    triggerValue,
                    replyType: node.type === "api" ? "api_request" : node.type,
                    isActive: true
                };

                if (node.type === "text") {
                    rule.replyText = nodeData.text || "";
                } else if (node.type === "interactive") {
                    if (isMetaNode) {
                        rule.replyType = "meta_template";
                        let rawName = nodeData.templateName || (nodeData.templateId ? String(nodeData.templateId).replace("meta:", "") : "");
                        rule.templateName = rawName;
                        rule.templateLanguage = nodeData.templateLanguage || "en";
                        rule.templateParams = nodeData.templateParams || {};
                        rule.replyInteractiveId = null;
                    } else {
                        rule.replyType = "interactive";
                        rule.replyInteractiveId = nodeData.templateId;
                        rule.templateParams = nodeData.templateParams || {};
                    }
                } else if (node.type === "api") {
                    rule.apiUrl = nodeData.apiUrl || "";
                    rule.apiBody = nodeData.apiBody || "";
                    rule.apiMethod = nodeData.apiMethod || "POST";
                    rule.apiHeaders = nodeData.apiHeaders || [];
                    rule.apiParams = nodeData.apiParams || [];
                    rule.responseAttributes = nodeData.responseAttributes || [];
                } else if (node.type === "set_attribute") {
                    rule.attributeName = nodeData.attributeName || "";
                    rule.attributeValue = nodeData.attributeValue || "";
                } else if (node.type === "add_tag") {
                    rule.tagName = nodeData.tagName || "";
                } else if (node.type === "intervention") {
                    // Intervention needs no special fields
                } else if (node.type === "condition") {
                    rule.conditionAttribute = nodeData.conditionAttribute || "";
                    rule.conditionOperator = nodeData.conditionOperator || "equals";
                    rule.conditionValue = nodeData.conditionValue || "";
                }

                // Find existing rule in flows state
                const existing = flows.find(f => f.triggerType === triggerType && f.triggerValue === triggerValue);
                let savedRule;
                const payload = { phoneNumberId: numberId, flowId, ...rule };
                if (existing) {
                    savedRule = await updateFlow({ id: existing._id, ...payload }).unwrap();
                } else {
                    savedRule = await createFlow(payload).unwrap();
                }

                const savedRuleId = savedRule.data?._id || savedRule._id;
                savedRuleIds[node.id] = savedRuleId;
                activeRulesList.push({ triggerType, triggerValue });

                // Map target ID for layout update
                nodeToRuleIdMap[node.id] = node.type === "interactive" 
                    ? (isMetaNode 
                        ? `template-meta-${nodeData.templateName || (nodeData.templateId ? String(nodeData.templateId).replace("meta:", "") : savedRuleId)}` 
                        : `template-${nodeData.templateId}`) 
                    : (node.type === "api" ? `api-${savedRuleId}` : `reply-${savedRuleId}`);

                // Traverse downstream connections
                if (node.type === "text" || node.type === "set_attribute" || node.type === "add_tag" || node.type === "intervention") {
                    const conn = connections.find(c => c.fromNodeId === node.id && c.fromPortId === "next");
                    if (conn) {
                        const targetNode = nodes.find(n => n.id === conn.toNodeId);
                        if (targetNode) {
                            await saveNode(targetNode, "next_step", String(savedRuleId));
                        }
                    }
                } else if (node.type === "condition") {
                    const trueConn = connections.find(c => c.fromNodeId === node.id && c.fromPortId === "true");
                    if (trueConn) {
                        const targetNode = nodes.find(n => n.id === trueConn.toNodeId);
                        if (targetNode) {
                            await saveNode(targetNode, "condition_branch", `${savedRuleId}-true`);
                        }
                    }
                    const falseConn = connections.find(c => c.fromNodeId === node.id && c.fromPortId === "false");
                    if (falseConn) {
                        const targetNode = nodes.find(n => n.id === falseConn.toNodeId);
                        if (targetNode) {
                            await saveNode(targetNode, "condition_branch", `${savedRuleId}-false`);
                        }
                    }
                } else if (node.type === "api") {
                    const codes = nodeData.statusCodes || ["200", "400", "fallback"];
                    for (const code of codes) {
                        const conn = connections.find(c => c.fromNodeId === node.id && c.fromPortId === code);
                        if (conn) {
                            const targetNode = nodes.find(n => n.id === conn.toNodeId);
                            if (targetNode) {
                                await saveNode(targetNode, "api_response", `${savedRuleId}-${code}`);
                            }
                        }
                    }
                } else if (node.type === "interactive") {
                    const isMeta = nodeData.templateType === "meta_template" || (nodeData.templateId && String(nodeData.templateId).startsWith("meta:"));
                    const rawName = nodeData.templateName || (nodeData.templateId ? String(nodeData.templateId).replace("meta:", "") : "");
                    const templateObj = isMeta 
                        ? metaTemplates?.find(t => t.name === rawName || `meta:${t.name}` === nodeData.templateId || t._id === rawName)
                        : interactiveTemplates?.find(t => t._id === nodeData.templateId);

                    const templateButtons = extractMetaButtonsFromTemplate(templateObj);

                    if (templateButtons.length > 0) {
                        for (const btn of templateButtons) {
                            const conn = connections.find(c => c.fromNodeId === node.id && c.fromPortId === btn.id);
                            if (conn) {
                                const targetNode = nodes.find(n => n.id === conn.toNodeId);
                                if (targetNode) {
                                    await saveNode(targetNode, "button_payload", btn.id);
                                }
                            }
                        }
                    } else {
                        const conn = connections.find(c => c.fromNodeId === node.id && (c.fromPortId === "next" || c.fromPortId === "out"));
                        if (conn) {
                            const targetNode = nodes.find(n => n.id === conn.toNodeId);
                            if (targetNode) {
                                await saveNode(targetNode, "next_step", String(savedRuleId));
                            }
                        }
                    }
                }

                return savedRule;
            };

            // Start saving from Keyword Trigger nodes
            const keywordNodes = nodes.filter(n => n.type === "keyword");
            for (const kw of keywordNodes) {
                await saveNode(kw);
            }

            // Start saving from root Interactive Template nodes (without incoming connections)
            const templateNodes = nodes.filter(n => n.type === "interactive");
            for (const tNode of templateNodes) {
                const incoming = connections.find(c => c.toNodeId === tNode.id);
                if (!incoming) {
                    const tNodeData = tNode.data || {};
                    const isMeta = tNodeData.templateType === "meta_template" || (tNodeData.templateId && String(tNodeData.templateId).startsWith("meta:"));
                    const rawName = tNodeData.templateName || (tNodeData.templateId ? String(tNodeData.templateId).replace("meta:", "") : "");
                    const templateObj = isMeta 
                        ? metaTemplates?.find(t => t.name === rawName || `meta:${t.name}` === tNodeData.templateId || t._id === rawName)
                        : interactiveTemplates?.find(t => t._id === tNodeData.templateId);

                    const templateButtons = extractMetaButtonsFromTemplate(templateObj);

                    if (templateButtons.length > 0) {
                        for (const btn of templateButtons) {
                            const conn = connections.find(c => c.fromNodeId === tNode.id && c.fromPortId === btn.id);
                            if (conn) {
                                const targetNode = nodes.find(n => n.id === conn.toNodeId);
                                if (targetNode) {
                                    await saveNode(targetNode, "button_payload", btn.id);
                                }
                            }
                        }
                    }
                }
            }

            // Clean up old duplicate rules in MongoDB that are no longer part of active saved nodes
            const activeSavedRuleIds = Object.values(savedRuleIds);
            const rulesToDelete = flows.filter(existing => {
                return existing._id && !activeSavedRuleIds.includes(String(existing._id));
            });

            if (rulesToDelete.length > 0) {
                const deletePromises = rulesToDelete.map(rule => 
                    deleteFlow({ phoneNumberId: numberId, id: rule._id }).unwrap()
                );
                await Promise.all(deletePromises);
            }

            // Step 5: Update local layout state & localStorage, purging any unmapped orphaned action nodes
            const updatedNodes = nodes
                .filter(node => {
                    if (node.type === "text" || node.type === "api") {
                        const hasRule = nodeToRuleIdMap[node.id] || savedRuleIds[node.id];
                        const hasIncomingConn = connections.some(c => c.toNodeId === node.id);
                        if (!hasRule && !hasIncomingConn) {
                            return false; // Automatically purge orphaned duplicate node
                        }
                    }
                    return true;
                })
                .map(node => {
                    const newId = nodeToRuleIdMap[node.id] || node.id;
                    return {
                        ...node,
                        id: newId
                    };
                });

            const updatedConnections = connections.filter(conn => {
                const fromExists = updatedNodes.some(n => n.id === conn.fromNodeId || nodeToRuleIdMap[conn.fromNodeId] === n.id);
                const toExists = updatedNodes.some(n => n.id === conn.toNodeId || nodeToRuleIdMap[conn.toNodeId] === n.id);
                return fromExists && toExists;
            }).map(conn => {
                const fromNew = nodeToRuleIdMap[conn.fromNodeId] || conn.fromNodeId;
                const toNew = nodeToRuleIdMap[conn.toNodeId] || conn.toNodeId;
                return {
                    ...conn,
                    id: `conn-${fromNew}-${toNew}-${conn.fromPortId}`,
                    fromNodeId: fromNew,
                    toNodeId: toNew
                };
            });

            // Commit the updated mapped layout to localStorage
            const layoutData = {
                nodes: updatedNodes,
                connections: updatedConnections,
                offset,
                zoom
            };
            localStorage.setItem(`mytekai_chatbot_flow_layout_${flowId || "legacy"}`, JSON.stringify(layoutData));

            if (flowId && updateFlowList) {
                try {
                    await updateFlowList({
                        phoneNumberId: numberId,
                        id: flowId,
                        layout: layoutData
                    }).unwrap();
                } catch (dbLayoutErr) {
                    console.error("Failed saving layout to DB:", dbLayoutErr);
                }
            }

            // Sync state directly so the visual canvas updates immediately without jumpiness
            setNodes(updatedNodes);
            setConnections(updatedConnections);

            setIsDirty(false);
            onHasUnsavedChangesChange?.(false);

            toast.success("Chatbot flow saved successfully!", { id: toastId });
            return true;
        } catch (error) {
            console.error("Save error", error);
            toast.error("Failed to compile or save some flow connections.", { id: toastId });
            return false;
        }
    };

    useEffect(() => {
        if (onRegisterSaveHandler) {
            onRegisterSaveHandler(handleSaveRules);
        }
    }, [handleSaveRules, onRegisterSaveHandler]);

    // Active wire drag preview path
    let dragWirePath = "";
    if (activePort) {
        const srcEl = document.getElementById(`port-${activePort.nodeId}-${activePort.portId}`);
        const containerEl = document.getElementById("visual-transform-container");
        if (srcEl && containerEl) {
            const containerRect = containerEl.getBoundingClientRect();
            const srcRect = srcEl.getBoundingClientRect();
            const x1 = (srcRect.right - containerRect.left) / zoom;
            const y1 = (srcRect.top + srcRect.height / 2 - containerRect.top) / zoom;
            const x2 = mousePos.x;
            const y2 = mousePos.y;
            const dx = Math.abs(x2 - x1) * 0.45;
            dragWirePath = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        }
    }

    return (
        <div className="w-full flex-1 flex min-h-0 bg-slate-100 dark:bg-slate-950 rounded-xl border border-border overflow-hidden select-none">
            
            {/* Draggable Sidebar Node Selector (AiSensy 2-column Grid Box style) */}
            <div className="w-64 border-r border-border bg-card flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {/* Message Types Section */}
                <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">Message Types</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Keyword Trigger */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "keyword")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Keyword Trigger - Flow starting point"
                        >
                            <Zap className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Keyword Trigger</span>
                        </div>

                        {/* Text Message */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "text")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Text Message - Simple reply message"
                        >
                            <MessageSquare className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Text Message</span>
                        </div>

                        {/* Interactive Layout */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "interactive")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Interactive Layout - Lists / Buttons menus"
                        >
                            <Layers className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Interactive Layout</span>
                        </div>

                        {/* API Request */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "api")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="API Request - Call external REST API"
                        >
                            <Globe className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">API Request</span>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="space-y-2 pt-2 border-t border-border">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Request Intervention */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "intervention")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Human Takeover - Pause bot for agent intervention"
                        >
                            <Bot className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Request Intervention</span>
                        </div>

                        {/* Condition */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "condition")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Condition - Branch flow based on attributes"
                        >
                            <GitFork className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Condition</span>
                        </div>

                        {/* Set Attribute */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "set_attribute")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Set Attribute - Modify contact property"
                        >
                            <FileText className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Set Attribute</span>
                        </div>

                        {/* Add Tag */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("nodeType", "add_tag")}
                            className="flex flex-col items-center justify-center p-2.5 text-center bg-white dark:bg-slate-900 hover:bg-[#eff6ff] dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-[#2563eb] rounded-xl cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all aspect-square gap-1.5 group"
                            title="Add Tag - Apply segments and tags"
                        >
                            <Layers className="h-5 w-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Add Tag</span>
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-t border-border mt-auto flex flex-col gap-2 shrink-0">
                    <button
                        onClick={handleSaveRules}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md active:scale-98 transition-all"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Visual Canvas Panel */}
            <div
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => {
                    if (isSpacePressed || isPanning) {
                        e.preventDefault();
                    }
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-900/60 canvas-grid ${
                    isPanning ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                    backgroundImage: `radial-gradient(#cbd5e1 ${1.2 * zoom}px, transparent ${1.2 * zoom}px), radial-gradient(#cbd5e1 ${1.2 * zoom}px, #f8fafc ${1.2 * zoom}px)`,
                    backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
                    backgroundPosition: `${offset.x}px ${offset.y}px`
                }}
            >
                {/* Visual Transform Container */}
                <div
                    id="visual-transform-container"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        transformOrigin: "0 0"
                    }}
                >
                    {/* SVG Connector Wires Layer */}
                    <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
                        <defs>
                            <style>{`
                                @keyframes wireSnake {
                                    0% { stroke-dashoffset: 20; }
                                    100% { stroke-dashoffset: 0; }
                                }
                            `}</style>
                            <marker
                                id="arrowhead"
                                viewBox="0 0 10 10"
                                refX="6"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
                            </marker>
                            <marker
                                id="arrowhead-active"
                                viewBox="0 0 10 10"
                                refX="6"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
                            </marker>
                        </defs>

                        {/* Rendering connected wires (AiSensy continuous snake style) */}
                        {resolvedWires.map((wire) => (
                            <g key={wire.id} className="pointer-events-auto group">
                                <path
                                    d={wire.path}
                                    fill="none"
                                    stroke="transparent"
                                    strokeWidth="14"
                                    className="cursor-pointer"
                                />
                                <path
                                    d={wire.path}
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="2.5"
                                    strokeDasharray="6 4"
                                    style={{ animation: "wireSnake 0.8s linear infinite" }}
                                    markerEnd="url(#arrowhead)"
                                    className="group-hover:stroke-blue-700 transition-all duration-150"
                                />
                                {/* Cross indicator to disconnect */}
                                <foreignObject
                                    x={wire.midX - 10}
                                    y={wire.midY - 10}
                                    width="20"
                                    height="20"
                                    className="opacity-80 group-hover:opacity-100 transition-opacity duration-150"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDisconnectWire(wire.id);
                                        }}
                                        className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-500 hover:border-red-500 flex items-center justify-center shadow-md border border-slate-300 dark:border-slate-700 transition-all text-xs font-bold"
                                        title="Disconnect wire"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </foreignObject>
                            </g>
                        ))}

                        {/* Wiring preview wire */}
                        {dragWirePath && (
                            <path
                                d={dragWirePath}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                strokeDasharray="6 4"
                                style={{ animation: "wireSnake 0.8s linear infinite" }}
                                markerEnd="url(#arrowhead-active)"
                            />
                        )}
                    </svg>

                    {/* Nodes Render Container */}
                    <div className="absolute inset-0 pointer-events-none">
                        {nodes.map((node) => {
                            if (!node) return null;
                            const nodeData = node.data || {};
                            const isSelectedTarget = hoveredPort === node.id;
                            
                            return (
                                <div
                                    key={node.id}
                                    id={node.id}
                                    onMouseEnter={() => activePort && setHoveredPort(node.id)}
                                    onMouseLeave={() => setHoveredPort(null)}
                                    className={`flow-node-card absolute w-72 pointer-events-auto bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-sm group select-none hover:shadow-md hover:border-[#2563eb] transition-shadow transition-colors duration-150 ${
                                        isSelectedTarget ? "ring-2 ring-[#2563eb]" : ""
                                    } ${isSpacePressed ? "cursor-grab" : ""}`}
                                    style={{
                                        left: node.x,
                                        top: node.y
                                    }}
                                >
                                    {/* Draggable handle bar */}
                                    <div
                                        onMouseDown={(e) => {
                                            if (!isSpacePressed) {
                                                handleNodeDragStart(e, node.id);
                                            }
                                        }}
                                        className="node-drag-handle h-3 bg-[#eff6ff] dark:bg-blue-950/40 rounded-t-xl cursor-move border-b border-blue-100 dark:border-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                    />

                                    {/* Delete Node option */}
                                    <button
                                        onClick={() => handleDeleteNode(node.id)}
                                        className="absolute top-2 right-2 p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Node"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Input Connection socket handle (on the left side) */}
                                    {node.type !== "keyword" && (
                                        <div
                                            id={`input-port-${node.id}`}
                                            className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#2563eb] bg-white dark:bg-slate-900 flex items-center justify-center shadow transition-transform duration-150 ${
                                                isSelectedTarget ? "scale-125 bg-[#2563eb] text-white" : ""
                                            }`}
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                                        </div>
                                    )}

                                    {/* Node specific card body */}
                                    <div className="p-4 space-y-3">
                                        {node.type === "keyword" && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <Zap className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-900 dark:text-slate-100">Keyword Trigger</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={nodeData.triggerValue || ""}
                                                    onChange={(e) => updateNodeData(node.id, "triggerValue", e.target.value)}
                                                    onBlur={() => pushStateToHistory(nodes, connections)}
                                                    className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                    placeholder="Trigger keyword..."
                                                />
                                                {/* Output handle on the right */}
                                                <div className="flex justify-end pt-1">
                                                    <div
                                                        id={`port-${node.id}-out`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, "out")}
                                                        className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow cursor-crosshair transition-all"
                                                        title="Drag connection wire"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "text" && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-900 dark:text-slate-100">Text Response</span>
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    value={nodeData.text || ""}
                                                    onChange={(e) => updateNodeData(node.id, "text", e.target.value)}
                                                    onBlur={() => pushStateToHistory(nodes, connections)}
                                                    onWheel={(e) => e.stopPropagation()}
                                                    className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-none"
                                                    placeholder="Reply message text..."
                                                />
                                                
                                                {/* Output handle on the right */}
                                                <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-slate-100 font-sans">Next Step</span>
                                                    <div
                                                        id={`port-${node.id}-next`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, "next")}
                                                        className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow cursor-crosshair transition-all"
                                                        title="Drag connection wire"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "interactive" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <Layers className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-900 dark:text-slate-100">Template Message</span>
                                                </div>
                                                
                                                <select
                                                    value={nodeData.templateId || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        updateNodeData(node.id, "templateId", val, true);
                                                        const isMeta = val.startsWith("meta:");
                                                        if (isMeta) {
                                                            const metaName = val.replace("meta:", "");
                                                            const metaObj = metaTemplates?.find(t => t.name === metaName || t._id === val.replace("meta:", ""));
                                                            updateNodeData(node.id, "templateType", "meta_template", false);
                                                            updateNodeData(node.id, "templateName", metaObj?.name || metaName, false);
                                                            const vars = extractMetaVariablesFromTemplate(metaObj);
                                                            const currentParams = nodeData.templateParams || {};
                                                            const initialParams = {};
                                                            vars.forEach((v) => {
                                                                initialParams[v] = currentParams[v] || (v === "1" ? "{{reply}}" : `{{var_${v}}}`);
                                                            });
                                                            updateNodeData(node.id, "templateParams", initialParams, false);
                                                        } else {
                                                            const interactiveObj = interactiveTemplates?.find(t => t._id === val);
                                                            updateNodeData(node.id, "templateType", "interactive", false);
                                                            const vars = extractMetaVariablesFromTemplate(interactiveObj);
                                                            const currentParams = nodeData.templateParams || {};
                                                            const initialParams = {};
                                                            vars.forEach((v) => {
                                                                initialParams[v] = currentParams[v] || (v === "1" ? "{{reply}}" : `{{var_${v}}}`);
                                                            });
                                                            updateNodeData(node.id, "templateParams", initialParams, false);
                                                        }
                                                    }}
                                                    className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                >
                                                    <option value="" disabled>Select Template</option>
                                                    {interactiveTemplates?.length > 0 && (
                                                        <optgroup label="Interactive Layout Templates">
                                                            {interactiveTemplates.map((t) => (
                                                                <option key={t._id} value={t._id}>
                                                                    {t.name} ({t.type === 'button' ? 'Quick Reply' : 'List'})
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                    {metaTemplates?.length > 0 && (
                                                        <optgroup label="Approved Meta WhatsApp Templates">
                                                            {metaTemplates
                                                                .filter(t => !t.status || String(t.status).toUpperCase() === 'APPROVED' || String(t.status).toUpperCase() === 'ENABLED')
                                                                .map((t) => (
                                                                    <option key={t._id || t.name} value={`meta:${t.name}`}>
                                                                        {t.name} (Meta Approved)
                                                                    </option>
                                                                ))}
                                                        </optgroup>
                                                    )}
                                                </select>

                                                {/* Template Variable Mapping Section */}
                                                {(() => {
                                                    const isMeta = nodeData.templateType === "meta_template" || (nodeData.templateId && String(nodeData.templateId).startsWith("meta:"));
                                                    const rawName = nodeData.templateName || (nodeData.templateId ? String(nodeData.templateId).replace("meta:", "") : "");
                                                    const templateObj = isMeta 
                                                        ? metaTemplates?.find(t => t.name === rawName || `meta:${t.name}` === nodeData.templateId)
                                                        : interactiveTemplates?.find(t => t._id === nodeData.templateId);

                                                    const vars = extractMetaVariablesFromTemplate(templateObj);

                                                    if (!templateObj && !nodeData.templateId) return null;
                                                    if (!isMeta && vars.length === 0) return null;

                                                    return (
                                                        <div className="space-y-2 pt-2 border-t border-blue-100 dark:border-blue-900/40 bg-[#eff6ff] dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/50">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                                                    {isMeta ? "Meta Approved Template" : "Interactive Template"}
                                                                </span>
                                                                <span className="text-[9px] bg-[#2563eb]/10 text-[#2563eb] dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">
                                                                    {isMeta ? "Approved" : "Custom Layout"}
                                                                </span>
                                                            </div>

                                                            {vars.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Map Variables ({"{{1}}"}, {"{{2}}"}...):</p>
                                                                    {vars.map((varKey) => (
                                                                        <div key={varKey} className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] font-mono font-bold bg-[#e0edff] text-[#2563eb] dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded shrink-0 border border-blue-200">
                                                                                {`{{${varKey}}}`}
                                                                            </span>
                                                                            <input
                                                                                type="text"
                                                                                value={nodeData.templateParams?.[varKey] || ""}
                                                                                onChange={(e) => {
                                                                                    const newParams = {
                                                                                        ...(nodeData.templateParams || {}),
                                                                                        [varKey]: e.target.value
                                                                                    };
                                                                                    updateNodeData(node.id, "templateParams", newParams, false);
                                                                                }}
                                                                                onBlur={() => pushStateToHistory(nodes, connections)}
                                                                                onWheel={(e) => e.stopPropagation()}
                                                                                placeholder={varKey === "1" ? "{{reply}} or {{name}}" : `Variable ${varKey}`}
                                                                                className="flex-1 text-[11px] px-2 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb] font-semibold text-slate-900 dark:text-slate-100"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-[10px] text-slate-500 italic">No variables detected in template body.</p>
                                                            )}

                                                            {(() => {
                                                                const templateButtons = extractMetaButtonsFromTemplate(templateObj);
                                                                if (templateButtons.length > 0) {
                                                                    return (
                                                                        <div className="space-y-2 pt-2 border-t border-blue-100 dark:border-blue-900/40 mt-2">
                                                                            <p className="text-[9px] uppercase font-bold text-slate-900 dark:text-slate-100">Interactive Outputs</p>
                                                                            {templateButtons.map((btn) => (
                                                                                <div key={btn.id} className="flex items-center justify-between bg-[#eff6ff] dark:bg-slate-800/60 px-2 py-1 rounded border border-blue-200 dark:border-slate-700 text-xs">
                                                                                    <span className="truncate max-w-[150px] font-semibold text-slate-900 dark:text-slate-100">
                                                                                        {btn.type === "list_row" ? "📋 " : "🖱️ "}{btn.title}
                                                                                    </span>
                                                                                    <div
                                                                                        id={`port-${node.id}-${btn.id}`}
                                                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, btn.id)}
                                                                                        className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 shadow cursor-crosshair transition-all"
                                                                                        title={`Connect wire for ${btn.title}`}
                                                                                    >
                                                                                        <Plus className="h-3 w-3" />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-900/40 mt-1">
                                                                        <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-slate-100 font-sans">Next Step</span>
                                                                        <div
                                                                            id={`port-${node.id}-next`}
                                                                            onMouseDown={(e) => handlePortMouseDown(e, node.id, "next")}
                                                                            className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow cursor-crosshair transition-all"
                                                                            title="Drag connection wire to next step"
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Interactive Menu Template inline creation buttons */}
                                                {(!nodeData.templateType || (nodeData.templateType === "interactive" && !String(nodeData.templateId || "").startsWith("meta:"))) && (
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenCreateTemplate(node.id)}
                                                            className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 border border-dashed border-blue-300 dark:border-blue-800 bg-[#eff6ff] dark:bg-blue-950/30 hover:bg-[#e0edff] text-[#2563eb] dark:text-blue-400 rounded-md text-[10px] font-bold transition-all"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Create Template Inline
                                                        </button>
                                                        
                                                        {nodeData.templateId && !String(nodeData.templateId).startsWith("meta:") && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditTemplate(node.id, nodeData.templateId)}
                                                                className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 border border-dashed border-blue-300 dark:border-blue-800 bg-[#eff6ff] dark:bg-blue-950/30 hover:bg-[#e0edff] text-[#2563eb] dark:text-blue-400 rounded-md text-[10px] font-bold transition-all"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                                Edit Template Inline
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {node.type === "api" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                        <Globe className="h-4 w-4" />
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-900 dark:text-slate-100">API Request</span>
                                                    </div>
                                                    <span className="px-1.5 py-0.5 bg-[#2563eb]/10 text-[#2563eb] dark:text-blue-400 text-[10px] font-bold rounded">
                                                        {nodeData.apiMethod || "POST"}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleOpenApiModal(node.id)}
                                                    className="w-full py-1.5 px-3 bg-[#eff6ff] hover:bg-[#e0edff] text-[#2563eb] rounded-lg text-xs font-bold transition-all border border-blue-200 flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                    Configure / Test API
                                                </button>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100">API Request Url</label>
                                                    <input
                                                        type="text"
                                                        value={nodeData.apiUrl || ""}
                                                        onChange={(e) => updateNodeData(node.id, "apiUrl", e.target.value)}
                                                        onBlur={() => pushStateToHistory(nodes, connections)}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                        placeholder="https://api.example.com/endpoint"
                                                    />
                                                </div>

                                                {Array.isArray(nodeData.responseAttributes) && nodeData.responseAttributes.length > 0 && (
                                                    <div className="space-y-1 bg-[#eff6ff] dark:bg-slate-800/40 p-2 rounded border border-blue-200 dark:border-slate-700 text-[10px]">
                                                        <p className="font-bold text-slate-900 dark:text-slate-100 uppercase">Captured Attributes ({nodeData.responseAttributes.length})</p>
                                                        <div className="space-y-0.5 font-mono text-slate-900 dark:text-slate-100 font-semibold">
                                                            {nodeData.responseAttributes.slice(0, 3).map((item, idx) => (
                                                                <div key={idx} className="truncate">
                                                                    <span className="font-bold text-[#2563eb] dark:text-blue-400">{item.attribute || "var"}</span> &larr; {item.responseKey || "path"}
                                                                </div>
                                                            ))}
                                                            {nodeData.responseAttributes.length > 3 && (
                                                                <p className="text-slate-500 text-[9px]">+ {nodeData.responseAttributes.length - 3} more...</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100">JSON data to send</label>
                                                    <textarea
                                                        rows={3}
                                                        value={nodeData.apiBody || ""}
                                                        onChange={(e) => updateNodeData(node.id, "apiBody", e.target.value)}
                                                        onBlur={() => pushStateToHistory(nodes, connections)}
                                                        onWheel={(e) => e.stopPropagation()}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-y text-slate-900 dark:text-slate-100 font-medium"
                                                        placeholder={`{\n  "mobile": "$MobileNumber"\n}`}
                                                    />
                                                </div>

                                                {/* Status Code mapping outputs */}
                                                <div className="space-y-2 pt-2 border-t border-border">
                                                    <p className="text-[9px] uppercase font-bold text-slate-900 dark:text-slate-100">Response Mapping</p>
                                                    
                                                    {(nodeData.statusCodes || ["200", "400", "fallback"]).map((code, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-[#eff6ff] dark:bg-slate-800/60 px-2 py-1 rounded border border-blue-200 dark:border-slate-700 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                {code !== "fallback" ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => removeStatusCode(node.id, code)}
                                                                            className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                                            title="Delete Status Code"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                        <input
                                                                            type="text"
                                                                            value={code}
                                                                            onChange={(e) => updateStatusCode(node.id, idx, e.target.value)}
                                                                            className="w-12 bg-transparent border-b border-blue-300 text-center font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2563eb]"
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <span className="font-bold text-slate-900 dark:text-slate-100 px-1 py-0.5">Status Fallback</span>
                                                                )}
                                                            </div>
                                                            <div
                                                                id={`port-${node.id}-${code}`}
                                                                onMouseDown={(e) => handlePortMouseDown(e, node.id, code)}
                                                                className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 shadow cursor-crosshair transition-all"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => addStatusCode(node.id)}
                                                        className="w-full mt-1.5 py-1.5 bg-[#eff6ff] hover:bg-[#e0edff] dark:bg-slate-800 border border-dashed border-blue-300 dark:border-blue-800 rounded text-[10px] font-bold text-[#2563eb] dark:text-blue-400 transition-all"
                                                    >
                                                        + Custom Status Code
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "condition" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <GitFork className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider font-sans text-slate-900 dark:text-slate-100">Branching Condition</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans">Contact Attribute</label>
                                                    <input
                                                        type="text"
                                                        value={nodeData.conditionAttribute || ""}
                                                        onChange={(e) => updateNodeData(node.id, "conditionAttribute", e.target.value)}
                                                        onBlur={() => pushStateToHistory(nodes, connections)}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                        placeholder="e.g. email, tags, customField"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans">Comparison</label>
                                                    <select
                                                        value={nodeData.conditionOperator || ""}
                                                        onChange={(e) => updateNodeData(node.id, "conditionOperator", e.target.value, true)}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                    >
                                                        <option value="equals">Equals</option>
                                                        <option value="not_equals">Does Not Equal</option>
                                                        <option value="contains">Contains</option>
                                                        <option value="greater_than">Greater Than</option>
                                                        <option value="less_than">Less Than</option>
                                                        <option value="exists">Exists / Is Set</option>
                                                    </select>
                                                </div>

                                                {nodeData.conditionOperator !== "exists" && (
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans">Value to Match</label>
                                                        <input
                                                            type="text"
                                                            value={nodeData.conditionValue || ""}
                                                            onChange={(e) => updateNodeData(node.id, "conditionValue", e.target.value)}
                                                            onBlur={() => pushStateToHistory(nodes, connections)}
                                                            className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                            placeholder="Match value..."
                                                        />
                                                    </div>
                                                )}

                                                {/* Output ports for true / false */}
                                                <div className="space-y-2 pt-2 border-t border-border">
                                                    <p className="text-[9px] uppercase font-bold text-slate-900 dark:text-slate-100 font-sans">Branch Outputs</p>
                                                    
                                                    <div className="flex items-center justify-between bg-[#eff6ff] dark:bg-slate-800/60 px-2 py-1 rounded border border-blue-200 dark:border-slate-700 text-xs">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">Yes / True</span>
                                                        <div
                                                            id={`port-${node.id}-true`}
                                                            onMouseDown={(e) => handlePortMouseDown(e, node.id, "true")}
                                                            className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 shadow cursor-crosshair transition-all"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between bg-[#eff6ff] dark:bg-slate-800/60 px-2 py-1 rounded border border-blue-200 dark:border-slate-700 text-xs">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">No / False</span>
                                                        <div
                                                            id={`port-${node.id}-false`}
                                                            onMouseDown={(e) => handlePortMouseDown(e, node.id, "false")}
                                                            className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 shadow cursor-crosshair transition-all"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "set_attribute" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider font-sans text-slate-900 dark:text-slate-100">Set Contact Attribute</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans">Attribute Name</label>
                                                    <input
                                                        type="text"
                                                        value={nodeData.attributeName || ""}
                                                        onChange={(e) => updateNodeData(node.id, "attributeName", e.target.value)}
                                                        onBlur={() => pushStateToHistory(nodes, connections)}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                        placeholder="e.g. city, signup_date"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans">Value (supports {"{{attribute}}"} variables)</label>
                                                    <input
                                                        type="text"
                                                        value={nodeData.attributeValue || ""}
                                                        onChange={(e) => updateNodeData(node.id, "attributeValue", e.target.value)}
                                                        onBlur={() => pushStateToHistory(nodes, connections)}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                        placeholder="e.g. New York, {{name}}"
                                                    />
                                                </div>

                                                {/* Output handle on the right */}
                                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                                    <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-slate-100 font-sans">Next Step</span>
                                                    <div
                                                        id={`port-${node.id}-next`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, "next")}
                                                        className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow cursor-crosshair transition-all"
                                                        title="Drag connection wire"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "add_tag" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <Layers className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider font-sans text-slate-900 dark:text-slate-100">Add Segment Tag</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans">Tag Name</label>
                                                    <input
                                                        type="text"
                                                        value={nodeData.tagName || ""}
                                                        onChange={(e) => updateNodeData(node.id, "tagName", e.target.value)}
                                                        onBlur={() => pushStateToHistory(nodes, connections)}
                                                        className="w-full bg-[#eff6ff] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                                                        placeholder="e.g. vip, warm_lead"
                                                    />
                                                </div>

                                                {/* Output handle on the right */}
                                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                                    <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-slate-100 font-sans">Next Step</span>
                                                    <div
                                                        id={`port-${node.id}-next`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, "next")}
                                                        className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow cursor-crosshair transition-all"
                                                        title="Drag connection wire"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {node.type === "intervention" && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5 text-[#2563eb]">
                                                    <Bot className="h-4 w-4" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider font-sans text-slate-900 dark:text-slate-100">Human Takeover</span>
                                                </div>
                                                
                                                <div className="p-2.5 rounded-lg bg-[#eff6ff] dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-slate-900 dark:text-slate-100 leading-normal font-sans">
                                                    This node pauses the chatbot's automatic responses and alerts agents via the Live Chat view.
                                                </div>

                                                {/* Output handle on the right */}
                                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                                    <span className="text-[10px] uppercase font-bold text-slate-900 dark:text-slate-100 font-sans">Next Step</span>
                                                    <div
                                                        id={`port-${node.id}-next`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, "next")}
                                                        className="w-5 h-5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow cursor-crosshair transition-all"
                                                        title="Drag connection wire"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Canvas Controls (Zoom & Undo/Redo) */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-border shadow-lg rounded-xl p-1.5 pointer-events-auto">
                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:pointer-events-none transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:pointer-events-none transition-colors"
                        title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
                    >
                        <Redo2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <button
                        onClick={() => {
                            setZoom(z => Math.max(0.05, Number((z - 0.1).toFixed(2))));
                            setTick(t => t + 1);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
                        title="Zoom Out"
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[11px] font-bold text-muted-foreground w-12 text-center select-none">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => {
                            setZoom(z => Math.min(2.5, Number((z + 0.1).toFixed(2))));
                            setTick(t => t + 1);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
                        title="Zoom In"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <button
                        onClick={() => {
                            setZoom(1);
                            setOffset({ x: 0, y: 0 });
                            setTick(t => t + 1);
                        }}
                        className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset Zoom & Pan"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Inline Template Builder Modal */}
            {isOpenInteractiveModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
                    <div className="bg-card w-full max-w-5xl h-[85vh] rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                        <div className="flex-1 overflow-y-auto min-h-0 bg-background">
                            <MetaInteractiveBuilder
                                hideHeader={true}
                                hideSavedTab={true}
                                selectedNumber={{ phoneNumberId: numberId }}
                                initialEditingId={initialEditingTemplateId}
                                onSaveSuccess={handleSaveTemplateSuccess}
                                onCancel={() => {
                                    setIsOpenInteractiveModal(false);
                                    setTargetNodeIdForNewTemplate(null);
                                    setInitialEditingTemplateId(null);
                                }}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* API Request Configuration & Testing Modal */}
            {isOpenApiModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
                    <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request</span>
                            <button
                                onClick={() => setIsOpenApiModal(false)}
                                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Method & URL Row */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={apiModalData.apiMethod}
                                    onChange={(e) => setApiModalData(prev => ({ ...prev, apiMethod: e.target.value }))}
                                    className="bg-slate-100 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-teal-500"
                                >
                                    <option value="POST">POST</option>
                                    <option value="GET">GET</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                                <input
                                    type="text"
                                    value={apiModalData.apiUrl}
                                    onChange={(e) => setApiModalData(prev => ({ ...prev, apiUrl: e.target.value }))}
                                    placeholder="https://api.example.com/endpoint"
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            {/* Tabs: Params | Headers | Body */}
                            <div className="border-b border-border">
                                <div className="flex gap-6 text-xs font-semibold">
                                    {["params", "headers", "body"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setApiModalData(prev => ({ ...prev, activeTab: tab }))}
                                            className={`py-2 capitalize border-b-2 transition-all ${
                                                apiModalData.activeTab === tab
                                                    ? "border-teal-600 text-teal-600 dark:text-teal-400 font-bold"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            {apiModalData.activeTab === "params" && (
                                <div className="space-y-2">
                                    {apiModalData.params.map((row, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                value={row.key}
                                                onChange={(e) => {
                                                    const next = [...apiModalData.params];
                                                    next[idx].key = e.target.value;
                                                    setApiModalData(prev => ({ ...prev, params: next }));
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Select attribute or type value"
                                                value={row.value}
                                                onChange={(e) => {
                                                    const next = [...apiModalData.params];
                                                    next[idx].value = e.target.value;
                                                    setApiModalData(prev => ({ ...prev, params: next }));
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            />
                                            {apiModalData.params.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const next = apiModalData.params.filter((_, i) => i !== idx);
                                                        setApiModalData(prev => ({ ...prev, params: next }));
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {idx === apiModalData.params.length - 1 && (
                                                <button
                                                    onClick={() => {
                                                        setApiModalData(prev => ({
                                                            ...prev,
                                                            params: [...prev.params, { key: "", value: "" }]
                                                        }));
                                                    }}
                                                    className="p-2 text-teal-600 border border-teal-600/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {apiModalData.activeTab === "headers" && (
                                <div className="space-y-2">
                                    {apiModalData.headers.map((row, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Header Key (e.g. Authorization)"
                                                value={row.key}
                                                onChange={(e) => {
                                                    const next = [...apiModalData.headers];
                                                    next[idx].key = e.target.value;
                                                    setApiModalData(prev => ({ ...prev, headers: next }));
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Header Value"
                                                value={row.value}
                                                onChange={(e) => {
                                                    const next = [...apiModalData.headers];
                                                    next[idx].value = e.target.value;
                                                    setApiModalData(prev => ({ ...prev, headers: next }));
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            />
                                            {apiModalData.headers.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const next = apiModalData.headers.filter((_, i) => i !== idx);
                                                        setApiModalData(prev => ({ ...prev, headers: next }));
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {idx === apiModalData.headers.length - 1 && (
                                                <button
                                                    onClick={() => {
                                                        setApiModalData(prev => ({
                                                            ...prev,
                                                            headers: [...prev.headers, { key: "", value: "" }]
                                                        }));
                                                    }}
                                                    className="p-2 text-teal-600 border border-teal-600/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {apiModalData.activeTab === "body" && (
                                <div className="space-y-1">
                                    <textarea
                                        rows={5}
                                        value={apiModalData.body}
                                        onChange={(e) => setApiModalData(prev => ({ ...prev, body: e.target.value }))}
                                        placeholder={`{\n  "mobile": "$MobileNumber"\n}`}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            )}

                            {/* Action Buttons: Test and Save */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={handleTestApi}
                                    disabled={apiModalData.isTesting}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                    {apiModalData.isTesting ? (
                                        <>
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        "Test"
                                    )}
                                </button>
                                <button
                                    onClick={handleSaveApiModal}
                                    className="px-5 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold transition-all shadow"
                                >
                                    Save
                                </button>
                            </div>

                            {/* Response Section */}
                            <div className="space-y-3 pt-3 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">Response</span>
                                    {apiModalData.testStatus && (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                            String(apiModalData.testStatus).startsWith("2")
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        }`}>
                                            Status: {apiModalData.testStatus}
                                        </span>
                                    )}
                                </div>

                                {/* Capture Response in Attribute Section */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground">Capture response in Attribute</label>
                                    {apiModalData.responseAttributes.map((row, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Target Attribute (e.g. date, enquiryId, state)"
                                                value={row.attribute}
                                                onChange={(e) => {
                                                    const next = [...apiModalData.responseAttributes];
                                                    next[idx].attribute = e.target.value;
                                                    setApiModalData(prev => ({ ...prev, responseAttributes: next }));
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Response JSON key path (e.g. data.percentage, data.otpLink, data.secureLink)"
                                                value={row.responseKey}
                                                onChange={(e) => {
                                                    const next = [...apiModalData.responseAttributes];
                                                    next[idx].responseKey = e.target.value;
                                                    setApiModalData(prev => ({ ...prev, responseAttributes: next }));
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                            />
                                            {apiModalData.responseAttributes.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const next = apiModalData.responseAttributes.filter((_, i) => i !== idx);
                                                        setApiModalData(prev => ({ ...prev, responseAttributes: next }));
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-red-200 dark:border-red-900/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {idx === apiModalData.responseAttributes.length - 1 && (
                                                <button
                                                    onClick={() => {
                                                        setApiModalData(prev => ({
                                                            ...prev,
                                                            responseAttributes: [...prev.responseAttributes, { attribute: "", responseKey: "" }]
                                                        }));
                                                    }}
                                                    className="p-2 text-teal-600 border border-teal-600/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Test Response Preview Code Box */}
                                <div className="bg-slate-50 dark:bg-slate-900/80 border border-border rounded-lg p-3 max-h-40 overflow-auto font-mono text-xs text-foreground">
                                    {apiModalData.testResponse !== null ? (
                                        <pre className="whitespace-pre-wrap">
                                            {typeof apiModalData.testResponse === "object"
                                                ? JSON.stringify(apiModalData.testResponse, null, 2)
                                                : String(apiModalData.testResponse)}
                                        </pre>
                                    ) : (
                                        <span className="text-muted-foreground/60 italic">
                                            Click "Test" above to send request and view response payload here.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
