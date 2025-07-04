import { Badge } from "@/components/ui/badge";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { AlertTriangle, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { AccountMapping } from "@/types/financial";
import { AccountBar } from "./AccountBar";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CategoryDropZoneProps {
  groupTitle: string;
  categories: string[];
  statement: string;
  mappings: AccountMapping[];
  onUpdate: (accountNumber: string, field: keyof AccountMapping, value: string) => void;
  getConfidence: (mapping: AccountMapping) => "high" | "medium" | "low";
}

export const CategoryDropZone = ({ 
  groupTitle,
  categories,
  statement, 
  mappings, 
  onUpdate, 
  getConfidence 
}: CategoryDropZoneProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const groupMappings = mappings.filter(mapping => 
    categories.includes(mapping.detailedCategory)
  );
  const lowConfidenceCount = groupMappings.filter(m => getConfidence(m) === "low").length;
  
  return (
    <div className="space-y-2">
      {/* Group Header */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-primary">{groupTitle}</h3>
          {lowConfidenceCount > 0 && (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {groupMappings.length}
          </Badge>
          {lowConfidenceCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {lowConfidenceCount} review
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
      
      {/* Categories */}
      {isExpanded && (
        <div className="space-y-3 pl-4">
          {categories.map(category => {
            const categoryMappings = mappings.filter(mapping => mapping.detailedCategory === category);
            const categoryLowConfidence = categoryMappings.filter(m => getConfidence(m) === "low").length;
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/20 rounded border-l-2 border-l-primary/30">
                  <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryMappings.length}
                    </Badge>
                    {categoryLowConfidence > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {categoryLowConfidence}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Droppable droppableId={category}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "min-h-[80px] p-2 rounded border-2 border-dashed transition-all",
                        snapshot.isDraggingOver 
                          ? "border-primary bg-primary/5 shadow-inner" 
                          : "border-muted-foreground/20 bg-muted/5"
                      )}
                    >
                      {categoryMappings.length === 0 && (
                        <div className="flex items-center justify-center h-full text-center text-muted-foreground text-xs py-4">
                          <div>
                            <GripVertical className="w-4 h-4 mx-auto mb-1 opacity-40" />
                            Drop accounts here
                          </div>
                        </div>
                      )}
                      
                      {categoryMappings.map((mapping, index) => (
                        <Draggable
                          key={mapping.accountNumber}
                          draggableId={mapping.accountNumber}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <AccountBar
                                mapping={mapping}
                                onUpdate={(field, value) => onUpdate(mapping.accountNumber, field, value)}
                                confidence={getConfidence(mapping)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};