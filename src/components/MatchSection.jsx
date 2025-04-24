import React from "react";
import MatchCard from "./MatchCard.jsx";
import "./MatchSection.css"
import {motion, AnimatePresence} from "framer-motion";

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
};

export default function MatchSection({ title, matches, predictions, onChange, boostAvailabilityMap }) {
    if (matches.length === 0) return null;

    return (
        <div className="match-section">
            <h3 className="match-section-title">
                {title}
            </h3>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="match-section-content"
            >
                <AnimatePresence>
                    {matches.length > 0 && matches.map((match) => (
                        <motion.div
                            key={match.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "tween", duration: 0.25 }}
                        >
                            <MatchCard
                                key={match.id}
                                match={match}
                                value={predictions[match.id]}
                                onChange={(field, value) => onChange(match.id, field, value)}
                                boostDisabled={boostAvailabilityMap[match.id]?.disabled}
                                isBoosted={predictions[match.id]?.isBoosted}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}